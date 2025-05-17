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
  const [occurrenceFilter, setOccurrenceFilter] = React.useState('All');

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
            // Count occurrences of each designer
            const designerOccurrences = {};
            results.data.forEach(designer => {
              const name = designer.name || 'Unknown';
              designerOccurrences[name] = (designerOccurrences[name] || 0) + 1;
            });
            
            // Process designer data
            const designerData = results.data.map((designer, index) => ({
              id: index,
              name: designer.name || 'Unknown',
              country: designer.country || 'Unknown',
              region: designer.region || 'Unknown',
              gender: designer.gender || 'Unknown',
              imageUrl: designer.image_url || `https://via.placeholder.com/150x200?text=${designer.name}`,
              occurrences: designerOccurrences[designer.name || 'Unknown']
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
  
  // Add occurrence filtering
  if (occurrenceFilter !== 'All') {
    // Handle "5+" special case
    const minOccurrences = occurrenceFilter === '5+' ? 5 : parseInt(occurrenceFilter);
    results = results.filter(designer => designer.occurrences >= minOccurrences);
  }
  
  setFilteredDesigners(results);
  calculateStats(results); // Update stats based on filtered data
}, [filters, designers, occurrenceFilter]);

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
  setOccurrenceFilter('All'); // Add this line
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
      <h1 className="text-4xl font-bold mb-6">741.6092: Graphic Designers</h1>
      
     <div className="mb-8">
  {/* Filter Groups */}
  <div className="filter-sections space-y-6">
    {/* Region Filters */}
    <div className="filter-group">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Region</h3>
      <div className="flex flex-wrap gap-2">
        {regions.map(region => (
          <button
            key={region}
            className={`text-sm py-1 px-2 rounded-full transition-colors ${
              filters.region === region 
                ? `bg-gray-800 text-white` 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => {
              // Reset country filter when region changes
              if (region !== filters.region) {
                setFilters(prevFilters => ({
                  ...prevFilters,
                  region: region,
                  country: 'All'
                }));
              } else {
                handleFilterChange('region', region);
              }
            }}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
    
    {/* Country Filters */}
    <div className="filter-group">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Country</h3>
      <div className="flex flex-wrap gap-2">
        <button
          key="All-country"
          className={`text-sm py-1 px-2 rounded-full transition-colors ${
            filters.country === 'All' 
              ? `bg-gray-800 text-white` 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => handleFilterChange('country', 'All')}
        >
          All
        </button>
        
        {countries
          .filter(country => country !== 'All')
          .filter(country => {
            if (filters.region === 'All') return true;
            return designers.some(d => d.country === country && d.region === filters.region);
          })
          .map(country => (
            <button
              key={country}
              className={`text-sm py-1 px-2 rounded-full transition-colors ${
                filters.country === country 
                  ? `bg-gray-800 text-white` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleFilterChange('country', country)}
            >
              {country}
            </button>
          ))
        }
      </div>
    </div>
    
    {/* Gender Filters */}
    <div className="filter-group">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Gender</h3>
      <div className="flex flex-wrap gap-2">
        {genders.map(gender => (
          <button
            key={gender}
            className={`text-sm py-1 px-2 rounded-full transition-colors ${
              filters.gender === gender 
                ? `bg-gray-800 text-white` 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleFilterChange('gender', gender)}
          >
            {gender}
          </button>
        ))}
      </div>
    </div>

{/* ADD THIS BLOCK: Occurrences Filter */}
<div className="filter-group">
  <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Appearances</h3>
  <div className="flex flex-wrap gap-2">
    <button
      key="All-occurrences"
      className={`text-sm py-1 px-2 rounded-full transition-colors ${
        occurrenceFilter === 'All' 
          ? `bg-gray-800 text-white` 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={() => setOccurrenceFilter('All')}
    >
      All
    </button>
    
    {/* Filter by occurrence count */}
    {['2', '3', '4', '5+'].map(count => (
      <button
        key={`occurrences-${count}`}
        className={`text-sm py-1 px-2 rounded-full transition-colors ${
          occurrenceFilter === count 
            ? `bg-gray-800 text-white` 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setOccurrenceFilter(count)}
      >
        {count === '5+' ? '5+ times' : `${count} or more`}
      </button>
    ))}
  </div>
</div>

{/* Reset Button */}
{(filters.region !== 'All' || filters.country !== 'All' || filters.gender !== 'All' || occurrenceFilter !== 'All') && (
  <button 
    onClick={resetFilters}
    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
  >
    Clear all filters
  </button>
)}
    
    {/* Reset Button */}
    {(filters.region !== 'All' || filters.country !== 'All' || filters.gender !== 'All') && (
      <button 
        onClick={resetFilters}
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        Clear all filters
      </button>
    )}
  </div>
</div>

{/* Stats section without region legend */}
<div className="stats mb-6">
  <p className="text-gray-700 mb-2">
    Highlighting {filteredDesigners.length} of {designers.length} designers
  </p>
</div>
      
    
<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
  {designers.map(designer => {
  // Check if this designer matches all the current filters
  const matchesFilters = 
    (filters.country === 'All' || designer.country === filters.country) &&
    (filters.region === 'All' || designer.region === filters.region) &&
    (filters.gender === 'All' || designer.gender === filters.gender) &&
    (occurrenceFilter === 'All' || 
     (occurrenceFilter === '5+' ? designer.occurrences >= 5 : 
      designer.occurrences >= parseInt(occurrenceFilter)))
    
    return (
      <div 
        key={designer.id} 
        className={`designer-card relative transition-opacity duration-300 ${
          matchesFilters ? 'opacity-100' : 'opacity-20'
        }`}
      >
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
          <p className="text-xs text-gray-500">{designer.region}</p>
        </div>
      </div>
    );
  })}
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
