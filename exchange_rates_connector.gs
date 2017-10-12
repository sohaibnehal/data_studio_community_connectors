//This connector uses API from Fixer.io (http://fixer.io/) to fetch exchange rates of different currencies. 
//Rates are quoted against the Euro by default. Quote against a different currency by setting the Base Currency in your configuration while setting it up with Data Studio.


function getConfig(request) 
{
  var config = {
    "configParams": [
      {
        "type": "TEXTAREA",
        "name": "BASE_CURRENCY",
        "displayName": "Base Currency",
        "helpText": "Enter the Base Currency for comparison (For eg: USD, EUR, AUD, etc.)",
        "placeholder": "Enter the Base Currency for comparison (For eg: USD, EUR, AUD, etc.)",
      }
    ]
  };
  return config;
};

var FixerIODataSchema = [
  // The schema for the given request, providing information on the organization and type of data.
  {
    name: 'date',
    label: 'Date',
    dataType: 'STRING',
    semantics: { conceptType: 'DIMENSION' }
  },
  {
    name: 'AUD',
    label: 'Australian Dollar',
    dataType: 'NUMBER',
    semantics: { conceptType: 'DIMENSION' }
  },
  {
    name: 'CAD',
    label: 'Canadian Dollar',
    dataType: 'NUMBER',
    semantics: { conceptType: 'DIMENSION' }
  },
  {
    name: 'EUR',
    label: 'Euro',
    dataType: 'NUMBER',
    semantics: { conceptType: 'DIMENSION' }
  },
  {
    name: 'USD',
    label: 'US Dollar',
    dataType: 'NUMBER',
    semantics: { conceptType: 'DIMENSION' }
  },
];

function getSchema(request) 
{
  var baseCurrency = request.configParams['BASE_CURRENCY'] || 'EUR';
  
  //Adjusting the schema as per the configurations set by user
  FixerIODataSchema =  FixerIODataSchema.map(function(i) {
    if (i.name === baseCurrency) {
      i['semantics'] = { 
        conceptType: 'METRIC',
        isReaggregatable: true
      };
    }
    return i;
  });
  
  return {
    schema: FixerIODataSchema
  };
};

function getData(request) 
{
  var baseCurrency = request.configParams['BASE_CURRENCY'] || 'EUR';
    
  // Prepare the schema for the fields requested.
  var dataSchema = [];
  dataSchema = request.fields.map(function(i) {
    var item;
    FixerIODataSchema.map(function(j) {
      if (i.name === j.name)
        {
          item = j;
          return;
        }
     });
    return item;
  });
  
  // Fetch the data 
  var response = JSON.parse(makeRequest(baseCurrency));
  
  // Prepare the tabular data.
  var rows = makeTabularData(response, dataSchema, baseCurrency);
  
  // Return the tabular data for the given request.
  return {
    schema: dataSchema,
    rows: rows
  };
};

function makeRequest(baseCurrency) 
{
  // Fetch the data with UrlFetchApp, e.g.:
  var url = 'http://api.fixer.io/latest?base='+baseCurrency;
  return UrlFetchApp.fetch(url);
}

function makeTabularData(responseData, schema, baseCurrency)
{
  var data = [], values = [], rates = responseData['rates'];
  values = schema.map(function(field) {
    switch (field.name)
      {
        case 'date':
          return responseData['date'];
        case 'AUD':
          if (baseCurrency === 'AUD') return 1;
          else return rates['AUD'];
        case 'CAD':
          if (baseCurrency === 'CAD') return 1;
          else return rates['CAD'];
        case 'EUR':
          if (baseCurrency === 'EUR') return 1;
          else return rates['EUR'];
        case 'USD':
          if (baseCurrency === 'USD') return 1;
          else return rates['USD'];
        default:
          return '';
      }
  });
  data.push({
    values: values
  });
  return data;
}

function getAuthType() 
{
  // Returns the authentication method required.
  var response = {
    "type": "NONE"
  };
  return response;
}
