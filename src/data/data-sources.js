
/**
 * Data Sources.
 *
 * [Tab] -> [Chart Group] -> [Chart]
 */

const ODN_DOMAIN = 'odn.data.socrata.com';

const attributions = {
    acs: {
        name: 'American Community Survey'
    }
};

const lineOptions = {
    curveType: 'function',
    lineWidth: 4,
    legend : { position : 'top' },
    pointShape : 'circle',
    pointSize : 6,
    height: 300,
    colors: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e', '#1abc9c']
}

const demographics = {
    name: 'Demographics',
    description: 'Information about population, race, age, and sex.',
    groups: [
        {
            name: 'Population',
            attribution: attributions.acs,
            domain: ODN_DOMAIN,
            fxf: 'e3rd-zzmr',
            charts: [
                {
                    name: 'Population over Time',
                    data: [
                        {
                            column: 'year',
                            label: 'Year',
                            type: 'string'
                        },
                        {
                            column: 'population',
                            label: 'Population',
                            formatter: google.visualization.NumberFormat,
                            formatterOptions: { pattern: '###,###' }
                        }
                    ],
                    chart: google.visualization.LineChart,
                    options: _.extend({}, lineOptions, {
                        title : 'Population over Time',
                        vAxis: { format: 'short' }
                    })
                },
                {
                    name: 'Population Change over Time',
                    data: [
                        {
                            column: 'year',
                            label: 'Year',
                            type: 'string',
                        },
                        {
                            column: 'population_percent_change',
                            label: 'Population Change',
                            type: 'number',
                            formatter: google.visualization.NumberFormat,
                            formatterOptions: { pattern: '#.##%' }
                        }
                    ],
                    transform: rows => {
                        return rows
                            .filter(row => row.year !== '2009')
                            .map(row => _.extend(row, { population_percent_change: parseFloat(row.population_percent_change) / 100 }));
                    },
                    chart: google.visualization.LineChart,
                    options: _.extend({}, lineOptions, {
                        title: 'Population Change over Time',
                        vAxis: { format: 'percent' }
                    })
                }
            ]
        }
    ]
};

const education =  {
    name: 'Education',
    description: 'Educational data.',
    groups: [
        {
            name: 'Education',
            attribution: attributions.acs,
            domain: ODN_DOMAIN,
            fxf: 'uf4m-5u8r',
            charts: [
                {
                    name: 'Graduation Rates',
                    data: [
                        {
                            column: 'percent_high_school_graduate_or_higher',
                            label: 'High School',
                        },
                        {
                            column: 'percent_bachelors_degree_or_higher',
                            label: 'College',
                        }
                    ],
                    transpose: [
                        {
                            column: 'variable',
                            label: 'Graduation Rate',
                            type: 'string'
                        },
                        {
                            column: 'value',
                            label: 'Value',
                            formatter: google.visualization.NumberFormat,
                            formatterOptions: { pattern: '#.##%' }
                        }
                    ],
                    transform: rows => {
                        return rows.map(row => {
                            row.value = parseFloat(row.value) / 100;
                            return row;
                        });
                    },
                    chart: google.visualization.Table
                }
            ]
        }
    ]
};

const earnings = {
    name: 'Earnings',
    description: 'Earnings and income data.',
    groups: [
        {
            name: 'Earnings',
            attribution: attributions.acs,
            domain: ODN_DOMAIN,
            fxf: 'wmwh-4vak',
            charts: [
                {
                    name: 'Median Earnings by Gender (Full-Time and Part-Time Workers)',
                    data: [
                        {
                            column: 'median_earnings',
                            label: 'All',
                        },
                        {
                            column: 'male_median_earnings',
                            label: 'Male',
                        },
                        {
                            column: 'female_median_earnings',
                            label: 'Female',
                        }
                    ],
                    transpose: [
                        {
                            column: 'variable',
                            label: '',
                            type: 'string'
                        },
                        {
                            column: 'value',
                            label: 'Value',
                            formatter: google.visualization.NumberFormat,
                            formatterOptions: { pattern: '###,###', prefix: '$' }
                        }
                    ],
                    chart: google.visualization.ColumnChart,
                    options: {
                        vAxis: {
                            format: 'currency',
                            viewWindow: {
                                min: 0
                            }
                        }
                    }
                },
                {
                    name: 'Median Earnings by Education Level (Full-Time and Part-Time Workers)',
                    data: [
                        {
                            column: 'median_earnings_less_than_high_school',
                            label: 'Less than High School'
                        },
                        {
                            column: 'median_earnings_high_school',
                            label: 'High School'
                        },
                        {
                            column: 'median_earnings_some_college_or_associates',
                            label: 'Some College or Associates'
                        },
                        {
                            column: 'median_earnings_bachelor_degree',
                            label: 'Bachelor\'s Degree'
                        },
                        {
                            column: 'median_earnings_graduate_or_professional_degree',
                            label: 'Graduate or Professional Degree'
                        }
                    ],
                    transpose: [
                        {
                            column: 'variable',
                            label: 'Level of Education',
                            type: 'string'
                        },
                        {
                            column: 'value',
                            label: 'Value'
                        }
                    ],
                    chart: google.visualization.ColumnChart,
                    options: {
                        vAxis: { format: 'currency' }
                    }
                }
            ]
        }
    ]
};

