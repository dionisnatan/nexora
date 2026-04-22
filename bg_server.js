const http = require('http');
const fs = require('fs');

const b64 = fs.readFileSync('public/icon.png').toString('base64');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      // Basic validation: must be a string and have a minimum length
      if (typeof body !== 'string' || body.length < 50) {
        res.writeHead(400);
        res.end('Invalid body');
        return;
      }
      const base64Data = body.replace(/^data:image\/png;base64,/, "");
      // Check if it's actually base64
      if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
        res.writeHead(400);
        res.end('Invalid base64');
        return;
      }
      fs.writeFileSync('public/icon_transparent.png', base64Data, 'base64');
      console.log('Saved public/icon_transparent.png');
      res.writeHead(200);
      res.end('OK');
      process.exit(0);
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`
      <canvas id="c"></canvas>
      <script>
        const img = new Image();
        img.src = 'data:image/png;base64,${b64}';
        img.onload = () => {
          const c = document.getElementById('c');
          c.width = img.width; c.height = img.height;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const idx = ctx.getImageData(0,0,c.width,c.height);
          const d = idx.data;
          
          for(let i=0; i<d.length; i+=4){
            // If white, make transparent
            if(d[i]>240 && d[i+1]>240 && d[i+2]>240) {
              d[i+3]=0;
            } else if(d[i]>220 && d[i+1]>220 && d[i+2]>220) {
              // Edge smoothing
              const maxC = Math.max(d[i],d[i+1],d[i+2]);
              d[i+3] = Math.round(d[i+3] * ((255 - maxC) / 35));
            }
          }
          
          ctx.putImageData(idx,0,0);
          fetch('/', {method:'POST', body: c.toDataURL('image/png')})
            .then(()=>console.log('done'));
        };
      </script>
    `);
  }
});
server.listen(8080, '127.0.0.1', () => console.log('Listening on 127.0.0.1:8080'));
