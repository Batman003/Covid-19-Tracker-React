import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';
import InfoBox from './InfoBox/InfoBox';
import Map from './Map/Map';
import Table from './Table/Table';
import { sortData, prettyPrintStat } from './util/util';
import LineGraph from './LineGraph/LineGraph';
import MenuTwoToneIcon from '@material-ui/icons/MenuTwoTone';
import "leaflet/dist/leaflet.css";
import './App.css';

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(2);
  const [mapCountries, setMapCountries] = useState([]);
  const [caseType, setCaseType] = useState('cases');

  //https://disease.sh/v3/covid-19/countries

  useEffect(() => {
    const fetchData = async () => {
      await fetch('https://disease.sh/v3/covid-19/all')
        .then((response) => response.json())
        .then((data) => {
          setCountryInfo(data);
        });
    };

    fetchData();
  }, {});

  useEffect(() => {
    //async means send a request and wait for it do something with info

    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ))

          const sortedData = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        })
    }
    getCountriesData();
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;


    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {

        console.log("MyData: " + data);
        setCountry(countryCode);
        setCountryInfo(data);
        countryCode === 'worldwide'
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(3);
      })
  }

  return (
    <div className="app">

      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select varient="outlined" value={country} onChange={onCountryChange} >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}

            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            active={caseType === 'cases'}
            onClick={(e) => setCaseType('cases')}
            title={"Coronavirus Cases"} cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} />
          <InfoBox
            active={caseType === 'recovered'}
            onClick={(e) => setCaseType('recovered')}
            title={"Recovered"} cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox
            isRed
            active={caseType === 'deaths'}
            onClick={(e) => setCaseType('deaths')}
            title={"Deaths"} cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)} />
        </div>

        <Map countries={mapCountries} center={mapCenter} zoom={mapZoom} caseType={caseType} />

      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Case by country</h3>
          <Table countries={tableData} />
          <h3>Worldwide new casese</h3>
          <hr />
          <LineGraph className="app__graph" caseType={caseType} />
        </CardContent>

      </Card>

    </div>
  );
}

export default App;
