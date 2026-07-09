const fs = require('fs');
const cap = fs.readFileSync('d:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/captain/TournamentsTab.jsx', 'utf8').split('\n');
const own = fs.readFileSync('d:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/owner/OwnerTournamentsTab.jsx', 'utf8').split('\n');

let modalBlock = cap.slice(400, 705).join('\n');

const stadiumSelect = `
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

modalBlock = modalBlock.replace('<option value="GroupStage">Vòng bảng (Group Stage)</option>\r\n                            </select>\r\n                          </div>', '<option value="GroupStage">Vòng bảng (Group Stage)</option>\r\n                            </select>\r\n                          </div>\n' + stadiumSelect);
modalBlock = modalBlock.replace('<option value="GroupStage">Vòng b�ng (Group Stage)</option>\n                            </select>\n                          </div>', '<option value="GroupStage">Vòng b�ng (Group Stage)</option>\n                            </select>\n                          </div>\n' + stadiumSelect);

const newOwn = [...own.slice(0, 204), modalBlock, ...own.slice(400)];

fs.writeFileSync('d:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/owner/OwnerTournamentsTab.jsx', newOwn.join('\n'), 'utf8');
console.log('Successfully written file');
