const DesignerGallery = () => {
  const [designers, setDesigners] = React.useState([]);
  const [filteredDesigners, setFilteredDesigners] = React.useState([]);
  const [countries, setCountries] = React.useState([]);
  const [regions, setRegions] = React.useState([]);
  const [genders, setGenders] = React.useState([]);
  const [filters, setFilters] = React.useState({
    country: 'All',
    region: 'All',
    gender: 'All'
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [stats, setStats] = React.useState({});

  // Region color mapping
  const regionColors = {
    "North America": "bg-blue-500",
    "Europe": "bg-yellow-500",
    "Asia": "bg-red-500",
    "South America": "bg-green-500",
    "Africa": "bg-purple-500",
    "Oceania": "bg-pink-500",
    "Middle East": "bg-orange-500",
    "Other": "bg-gray-500"
  };

  React.useEffect(() => {
    // Load CSV data
    fetch('designers.csv')
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('Parsed data:', results);
            
            if (results.data && results.data.length > 0) {
              // Process designer data
              const designerData = results.data.map((designer, index) => ({
                id: index,
                name: designer.name || 'Unknown',
                country: designer.country || 'Unknown',
                region: designer.region || 'Unknown',
                gender: designer.gender || 'Unknown',
                imageUrl: designer.image_url || `https://via.placeholder.com/150x200?text=${designer.name}`
              }));
              
              setDesigners(designerData);
              setFilteredDesigners(designerData);
              
              // Extract unique countries, regions, and genders for filters
              const uniqueCountries = ['All', ...new Set(designerData.map(d => d.country).filter(Boolean))];
              const uniqueRegions = ['All', ...new Set(designerData.map(d => d.region).filter(Boolean))];
              const uniqueGenders = ['All', ...new Set(designerData.map(d => d.gender).filter(Boolean))];
              
              setCountries(uniqueCountries);
              setRegions(uniqueRegions);
              setGenders(uniqueGenders);
              
              // Calculate initial statistics
              calculateStats(designerData);
            }
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Failed to parse the CSV file');
            setLoading(false);
          }
        });
      })
      .catch(err => {
        console.error('Error loading file:', err);
        setError('Failed to load the CSV file');
        setLoading(false);
      });
  }, []);

  // Calculate statistics based on the data
  const calculateStats = (data) => {
    // Gender distribution
    const genderStats = data.reduce((acc, designer) => {
      acc[designer.gender] = (acc[designer.gender] || 0) + 1;
      return acc;
    }, {});
    
    // Region distribution
    const regionStats = data.reduce((acc, designer) => {
      acc[designer.region] = (acc[designer.region] || 0) + 1;
      return acc;
    }, {});
    
    setStats({
      gender: genderStats,
      region: regionStats
    });
  };

  // Apply filters when they change
  React.useEffect(() => {
    let results = [...designers];
    
    if (filters.country !== 'All') {
      results = results.filter(designer => designer.country === filters.country);
    }
    
    if (filters.region !== 'All') {
      results = results.filter(designer => designer.region === filters.region);
    }
    
    if (filters.gender !== 'All') {
      results = results.filter(designer => designer.gender === filters.gender);
    }
    
    setFilteredDesigners(results);
    calculateStats(results); // Update stats based on filtered data
  }, [filters, designers]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      country: 'All',
      region: 'All',
      gender: 'All'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">741.6092: Graphic Designers</h1>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="filter-group">
          <label className="block mb-2 font-semibold">Region:</label>
          <select 
            className="border rounded px-3 py-2 min-w-40"
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="block mb-2 font-semibold">Country:</label>
          <select 
            className="border rounded px-3 py-2 min-w-40"
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
          >
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="block mb-2 font-semibold">Gender:</label>
          <select 
            className="border rounded px-3 py-2 min-w-32"
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
          >
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group mt-auto">
          <button 
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      <div className="stats mb-6">
        <p className="text-gray-700 mb-2">
          Showing {filteredDesigners.length} of {designers.length} designers
        </p>
        
        {/* Region legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(regionColors).map(([region, color]) => (
            stats.region && stats.region[region] ? 
            <div key={region} className="flex items-center">
              <div className={`w-3 h-3 ${color} rounded-full mr-1`}></div>
              <span className="text-xs">{region} ({stats.region[region] || 0})</span>
            </div> : null
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filteredDesigners.map(designer => (
          <div key={designer.id} className="designer-card relative">
            {/* Region color indicator */}
            <div 
              className={`absolute top-0 right-0 w-3 h-3 rounded-full ${regionColors[designer.region] || 'bg-gray-500'}`} 
              title={designer.region}
            ></div>
            
            <img 
              src={designer.imageUrl} 
              alt={designer.name}
              className="w-full h-auto bg-gray-200"
            />
            <div className="mt-1 text-sm">
              <p className="font-semibold truncate">{designer.name}</p>
              <p className="text-xs text-gray-600">{designer.country}</p>
              <p className="text-xs text-gray-500">{designer.gender}</p>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDesigners.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No designers match your current filters.
        </div>
      )}
    </div>
  );
};

// Render the component
ReactDOM.render(<DesignerGallery />, document.getElementById('root'));
