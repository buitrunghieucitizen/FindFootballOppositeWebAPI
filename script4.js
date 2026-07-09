const fs = require('fs');
const captain = fs.readFileSync('d:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/captain/TournamentsTab.jsx', 'utf8');
const owner = fs.readFileSync('d:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/owner/OwnerTournamentsTab.jsx', 'utf8');

const capStart = captain.indexOf('{/* MODAL T');
const capEnd = captain.indexOf('document.body\n        )', capStart) + 24;
const modalBlock = captain.substring(capStart, capEnd);

const ownStart = owner.indexOf('{/* MODAL T');
const ownEnd = owner.indexOf('document.body\n      )', ownStart) + 22;

let newOwner = owner.substring(0, ownStart) + modalBlock + '\n      }' + owner.substring(ownEnd + 1);

let stadiumSelect = `
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sân thi đ�5</label>
                            <select
                              required
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                              value={formData.stadium}
                              onChange={e => setFormData({...formData, stadium: e.target.value})}
                            >
                              <option value="">-- Chọn sân của bạn --</option>
                              {myStadiums.map(s => (
                                <option key={s.stadiumId} value={s.stadiumName}>{s.stadiumName}</option>
                              ))}
                            </select>
                          </div>`;

newOwner = newOwner.replace('<option value="GroupStage">Vòng bảng (Group Stage)</option>\n                            </select>\n                          </div>', '<option value="GroupStage">Vòng bảng (Group Stage)</option>\n                            </select>\n                          </div>\n' + stadiumSelect);

fs.writeFileSync('d:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/owner/OwnerTournamentsTab.jsx', newOwner, 'utf8');
console.log('Success!');