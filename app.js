const DesignerGallery = () => {
  const [designers, setDesigners] = React.useState([]);
  const [filteredDesigners, setFilteredDesigners] = React.useState([]);
  const [countries, setCountries] = React.useState([]);
  const [genders, setGenders] = React.useState([]);
  const [filters, setFilters] = React.useState({
    country: 'All',
    gender: 'All'
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

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
                gender: designer.gender || 'Unknown',
                imageUrl: designer.image_url || `https://via.placeholder.com/150x200?text=${designer.name}`
              }));
              
              setDesigners(designerData);
              setFilteredDesigners(designerData);
              
              // Extract unique countries and genders for filters
              const uniqueCountries = ['All', ...new Set(designerData.map(d => d.country).filter(Boolean))];
              const uniqueGenders = ['All', ...new Set(designerData.map(d => d.gender).filter(Boolean))];
              
              setCountries(uniqueCountries);
              setGenders(uniqueGenders);
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

  // Apply filters when they change
  React.useEffect(() => {
    let results = [...designers];
    
    if (filters.country !== 'All') {
      results = results.filter(designer => designer.country === filters.country);
    }
    
    if (filters.gender !== 'All') {
      results = results.filter(designer => designer.gender === filters.gender);
    }
    
    setFilteredDesigners(results);
  }, [filters, designers]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
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
      <h1 className="text-2xl font-bold mb-6">Design Canon Representation Project</h1>
      
      <div className="mb-6 flex flex-wrap gap-4">
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
      </div>
      
      <div className="stats mb-6">
        <p className="text-gray-700">
          Showing {filteredDesigners.length} of {designers.length} designers
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filteredDesigners.map(designer => (
          <div key={designer.id} className="designer-card">
            <img 
              src={designer.imageUrl} 
              alt={designer.name}
              className="w-full h-auto bg-gray-200"
            />
            <div className="mt-1 text-sm">
              <p className="font-semibold truncate">{designer.name}</p>
              <p className="text-xs text-gray-600">{designer.country}</p>
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
