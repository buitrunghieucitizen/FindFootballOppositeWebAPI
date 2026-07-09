const fs = require('fs');
const files = [
  'd:/FInd_Op_Web_Project/FindFootballOppsites/BackEnd/FInd_Op_Web/FInd_Op_Web/Controllers/StadiumOwnerController.cs',
  'd:/FInd_Op_Web_Project/FindFootballOppsites/BackEnd/FInd_Op_Web/FInd_Op_Web/Controllers/CaptainController.cs'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // if content contains 'Ã', it's likely mojibake
  if (content.includes('Ã')) {
    // encode back to latin1 (windows-1252) buffer, then decode as utf8
    const buffer = Buffer.from(content, 'latin1');
    const fixedContent = buffer.toString('utf8');
    // if fixedContent doesn't look completely garbled, save it
    if (fixedContent.includes('Yêu cầu')) {
      fs.writeFileSync(file, fixedContent, 'utf8');
      console.log(`Fixed encoding for ${file}`);
    } else {
      console.log(`Conversion might have failed for ${file}, didn't find 'Yêu cầu'`);
    }
  } else {
    console.log(`No encoding issues found in ${file}`);
  }
}
