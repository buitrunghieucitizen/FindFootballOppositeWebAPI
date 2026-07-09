const fs = require('fs');

const captainPath = 'd:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/captain/TournamentsTab.jsx';
const ownerPath = 'd:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/owner/OwnerTournamentsTab.jsx.temp1';

let captain = fs.readFileSync(captainPath, 'utf8');
let owner = fs.readFileSync(ownerPath, 'utf8');

const modalStartTag = '{/* MODAL T?O GI?I Ð?U */}';
const modalEndTag = 'document.body\n        )';

const capStart = captain.indexOf(modalStartTag);
const capEnd = captain.indexOf(modalEndTag, capStart) + modalEndTag.length;
const modalBlock = captain.substring(capStart, capEnd);

const ownStart = owner.indexOf(modalStartTag);
const ownEnd = owner.indexOf('document.body\n      )') + 'document.body\n      )'.length;

let newOwner = owner.substring(0, ownStart) + modalBlock + '\n      }' + owner.substring(ownEnd + 1);

const stadiumSelect = "<div>\n" +
"  <label className='block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2'>Sân thi d?u</label>\n" +
"  <select\n" +
"    required\n" +
"    className='w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-yellow-500'\n" +
"    value={formData.stadium}\n" +
"    onChange={e => setFormData({...formData, stadium: e.target.value})}\n" +
"  >\n" +
"    <option value=''>-- Ch?n sân c?a b?n --</option>\n" +
"    {myStadiums.map(s => (\n" +
"      <option key={s.stadiumId} value={s.stadiumName}>{s.stadiumName}</option>\n" +
"    ))}\n" +
"  </select>\n" +
"</div>\n";

newOwner = newOwner.replace('<option value="GroupStage">Vòng b?ng (Group Stage)</option>', '<option value="GroupStage">Vòng b?ng (Group Stage)</option></select></div>' + stadiumSelect);

fs.writeFileSync('d:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/owner/OwnerTournamentsTab.jsx', newOwner);
console.log('Done!');
