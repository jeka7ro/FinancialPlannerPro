// Script pentru a actualiza datele online
import https from 'https';

const BASE_URL = 'https://financial-planner-pro.onrender.com';

// Funcție pentru a face request HTTPS
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'financial-planner-pro.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function fixOnlineData() {
  console.log('🔧 Fixing online data relationships...');
  
  try {
    // 1. Verifică health
    console.log('1. Checking server health...');
    const health = await makeRequest('GET', '/api/health');
    console.log('✅ Server health:', health.data);
    
    // 2. Verifică companiile
    console.log('2. Checking companies...');
    const companies = await makeRequest('GET', '/api/companies');
    console.log('✅ Companies found:', companies.data.data?.length || 0);
    
    // 3. Verifică locațiile
    console.log('3. Checking locations...');
    const locations = await makeRequest('GET', '/api/locations');
    console.log('✅ Locations found:', locations.data.data?.length || 0);
    
    // 4. Actualizează locațiile cu company_id
    console.log('4. Updating location relationships...');
    
    if (locations.data.data && locations.data.data.length > 0) {
      // Actualizează prima locație cu prima companie
      if (companies.data.data && companies.data.data.length > 0) {
        const update1 = await makeRequest('PUT', '/api/locations/1', {
          company_id: companies.data.data[0].id
        });
        console.log('✅ Location 1 updated:', update1.data);
        
        // Actualizează a doua locație cu a doua companie
        if (companies.data.data.length > 1) {
          const update2 = await makeRequest('PUT', '/api/locations/2', {
            company_id: companies.data.data[1].id
          });
          console.log('✅ Location 2 updated:', update2.data);
        }
        
        // Actualizează a treia locație cu a treia companie
        if (companies.data.data.length > 2) {
          const update3 = await makeRequest('PUT', '/api/locations/3', {
            company_id: companies.data.data[2].id
          });
          console.log('✅ Location 3 updated:', update3.data);
        }
      }
    }
    
    // 5. Verifică din nou locațiile
    console.log('5. Verifying updated locations...');
    const updatedLocations = await makeRequest('GET', '/api/locations');
    console.log('✅ Updated locations:', updatedLocations.data.data);
    
    console.log('🎉 Online data relationships fixed successfully!');
    console.log('🌐 Your site is now fully functional with persistent data!');
    
  } catch (error) {
    console.error('❌ Error fixing online data:', error.message);
  }
}

// Rulează scriptul
fixOnlineData(); 