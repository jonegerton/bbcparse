/*

Lists Nitro categories, formats (known to the BBC as aggregations)

*/

var http = require('http');

function category_dump(obj) {
	console.log('# Category list dump');
	var first = true;
	for (var i in obj.categories) {
		c = obj.categories[i];
		console.log(c.id+' '+c.type+' '+c.key+' = '+c.title);
		if (c.type == 'genre' || c.type == 'format') {
			for (var j in c.narrower) {
				n = c.narrower[j];
				console.log('  '+n.id+' '+n.type+' '+c.key+'/'+n.key+' = '+n.title);
				if (j.narrower && j.narrower.length>0) {
					console.log('Recursive');
				}
			}
		}
		else {
		  console.log('?? '+c.type);
		}
	}
}

function list_categories(path) {
	var options = {
	  hostname: 'clifton.api.bbci.co.uk'
	  ,port: 80
	  ,path: path
	  ,method: 'GET'
	  ,headers: { 'Content-Type': 'application/json' }
	};

	var list = '';
	var cat;

	var req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  res.on('data', function (data) {
		   list += data;
	  });
	  res.on('end', function() {
		   try {
				cat = JSON.parse(list);
				category_dump(cat);
		   }
		   catch(err) {
			   if ((res.statusCode>=400) && (res.statusCode<600)) {
				   console.log(res.statusCode+' '+res.statusMessage);
			   }
			   else {
					console.log('Something went wrong parsing the category/format JSON');
					console.log(err);
					console.log('** '+list);
			   }
		   }
	   });
	});
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	  console.log(e);
	});
	req.end();
}

//------------------------------------------------------------------------[main]

// was http://polling.bbc.co.uk/radio/categories.json
// http://clifton.api.bbci.co.uk/aps/programmes/genres.json
// http://clifton.api.bbci.co.uk/aps/programmes/formats.json

var type = 'genre';
if (process.argv.length>2) {
	type = process.argv[2];
}
if (type.startsWith('genre')) {
	list_categories('/aps/programmes/genres.json');
}
else if (type.startsWith('format')) {
	list_categories('/aps/programmes/formats.json');
}
else {
	console.log('Unknown type: genres|formats');
}

