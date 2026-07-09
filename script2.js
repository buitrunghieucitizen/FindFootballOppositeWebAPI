const fs = require('fs');
const captainPath = 'd:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/captain/TournamentsTab.jsx';
const ownerPath = 'd:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/owner/OwnerTournamentsTab.jsx';

let captain = fs.readFileSync(captainPath, 'utf8');
let owner = fs.readFileSync(ownerPath, 'utf8');

const capStart = captain.indexOf('{/* MODAL T');
const capEnd = captain.indexOf('document.body\n        )', capStart) + 'document.body\n        )'.length;
const modalBlock = captain.substring(capStart, capEnd);

const ownStart = owner.indexOf('{/* MODAL T');
const ownEnd = owner.indexOf('document.body\n      )', ownStart) + 'document.body\n      )'.length;

let newOwner = owner.substring(0, ownStart) + modalBlock + '\n      }' + owner.substring(ownEnd + 1);

let stadiumSelect = "                          <div>\n";
stadiumSelect += "                            <label className='block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2'>Sân thi đấu</label>\n";
stadiumSelect += "                            <select\n";
stadiumSelect += "                              required\n";
stadiumSelect += "                              className='w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500'\n";
stadiumSelect += "                              value={formData.stadium}\n";
stadiumSelect += "                              onChange={e => setFormData({...formData, stadium: e.target.value})}\n";
stadiumSelect += "                            >\n";
stadiumSelect += "                              <option value=''>-- Chọn sân của bạn --</option>\n";
stadiumSelect += "                              {myStadiums.map(s => (\n";
stadiumSelect += "                                <option key={s.stadiumId} value={s.stadiumName}>{s.stadiumName}</option>\n";
stadiumSelect += "                              ))}\n";
stadiumSelect += "                            </select>\n";
stadiumSelect += "                          </div>\n";

newOwner = newOwner.replace('<option value="GroupStage">Vòng bảng (Group Stage)</option>', '<option value="GroupStage">Vòng bảng (Group Stage)</option></select></div>\n' + stadiumSelect);

fs.writeFileSync(ownerPath, newOwner, 'utf8');
console.log('Success!');
