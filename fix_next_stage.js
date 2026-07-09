const fs = require('fs');

function injectNextStage(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add states
    if (!content.includes('const [showNextStageModal, setShowNextStageModal]')) {
        content = content.replace(
            /const \[bracket, setBracket\] = useState\(null\);/,
            `const [bracket, setBracket] = useState(null);\n  const [showNextStageModal, setShowNextStageModal] = useState(false);\n  const [nextStageFormat, setNextStageFormat] = useState('Knockout');\n  const [nextStageTeamsCount, setNextStageTeamsCount] = useState(4);\n  const [activeStageTab, setActiveStageTab] = useState('stage1');`
        );
    }

    // 2. Add handleGenerateNextStage
    if (!content.includes('const handleGenerateNextStage')) {
        const handleSaveBracketIndex = content.indexOf('const handleSaveBracket = async () => {');
        const nextStageFunc = `
  const handleGenerateNextStage = () => {
    let allStandings = [];
    if (settings.format === 'GroupStage' && bracket?.groups) {
      bracket.groups.forEach(g => {
        if (g.standings) allStandings = [...allStandings, ...g.standings];
      });
    } else if (settings.format === 'Swiss' && bracket?.standings) {
      allStandings = [...bracket.standings];
    } else if (settings.format === 'League' && bracket?.teams) {
       // League
    }
    
    allStandings.sort((a, b) => b.points - a.points || b.gd - a.gd || b.won - a.won);
    
    const topTeams = allStandings.slice(0, nextStageTeamsCount).map(s => ({ id: s.teamId || s.id, name: s.name }));
    
    let stage2Data = {};
    if (nextStageFormat === 'Knockout') {
      stage2Data = { format: 'Knockout', ...generateKnockout(topTeams, nextStageTeamsCount) };
    } else {
      stage2Data = { format: 'DoubleElimination', ...generateDoubleElimination(topTeams, nextStageTeamsCount) };
    }
    
    const newBracket = { ...bracket, stage2: stage2Data };
    setBracket(newBracket);
    setActiveStageTab('stage2');
    setShowNextStageModal(false);
    alert('Đã tạo Vòng 2 thành công! Hãy bấm Lưu Sơ Đồ để áp dụng.');
  };

`;
        content = content.slice(0, handleSaveBracketIndex) + nextStageFunc + content.slice(handleSaveBracketIndex);
    }

    // 3. Add Tab switcher
    if (!content.includes('Vòng 2 (Knockout)')) {
        content = content.replace(
            /\{settings\.format === 'Swiss' && \(/,
            `{bracket?.stage2 && (
                  <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-max">
                    <button 
                      onClick={() => setActiveStageTab('stage1')}
                      className={\`px-4 py-2 rounded-lg font-bold text-sm \${activeStageTab === 'stage1' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                    >
                      Vòng 1
                    </button>
                    <button 
                      onClick={() => setActiveStageTab('stage2')}
                      className={\`px-4 py-2 rounded-lg font-bold text-sm \${activeStageTab === 'stage2' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
                    >
                      Vòng 2 (Knockout)
                    </button>
                  </div>
                )}
                
                <div style={{ display: activeStageTab === 'stage1' ? 'block' : 'none' }}>
                {settings.format === 'Swiss' && (`
        );
        
        // close the div
        content = content.replace(
            /\{settings\.format === 'League' && \([\s\S]*?\}\)[\s\S]*?<\/LeagueMap>[\s\S]*?\}\)/,
            match => match + `\n                </div>\n                
                <div style={{ display: activeStageTab === 'stage2' ? 'block' : 'none' }}>
                  {bracket?.stage2?.format === 'Knockout' && (
                    <KnockoutBracket 
                      tournamentId={id}
                      service={filePath.includes('Owner') ? stadiumOwnerService : captainService}
                      data={bracket.stage2}
                      teams={teams}
                      onMatchUpdate={(newBracket) => {
                        setBracket({ ...bracket, stage2: newBracket });
                      }}
                    />
                  )}
                  {bracket?.stage2?.format === 'DoubleElimination' && (
                    <DoubleEliminationBracket 
                      tournamentId={id}
                      service={filePath.includes('Owner') ? stadiumOwnerService : captainService}
                      data={bracket.stage2}
                      teams={teams}
                      onMatchUpdate={(newBracket) => {
                        setBracket({ ...bracket, stage2: newBracket });
                      }}
                    />
                  )}
                </div>`
        );
    }
    
    // 4. Add 'Tạo vòng sau' button
    if (!content.includes('Tạo Vòng Sau')) {
        content = content.replace(
            /<button \n\s*onClick=\{handleSaveBracket\}/,
            `{(settings.format === 'GroupStage' || settings.format === 'Swiss') && (
                      <button 
                        onClick={() => setShowNextStageModal(true)}
                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 font-bold px-4 py-2 rounded-xl text-sm hover:bg-purple-200 transition-colors"
                      >
                        Tạo Vòng Sau
                      </button>
                    )}
                    <button 
                      onClick={handleSaveBracket}`
        );
    }
    
    // 5. Add Modal HTML at the end before closing div
    if (!content.includes('Tạo Vòng Đấu Tiếp Theo')) {
        let matchIndex = content.lastIndexOf('</div>');
        content = content.replace(
            /\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/,
            match => `
      {showNextStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Tạo Vòng Đấu Tiếp Theo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thể thức vòng sau</label>
                <select 
                  value={nextStageFormat}
                  onChange={e => setNextStageFormat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                >
                  <option value="Knockout">Loại trực tiếp (Knockout)</option>
                  <option value="DoubleElimination">Nhánh thắng / Nhánh thua (Double Elim)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số lượng đội đi tiếp</label>
                <select 
                  value={nextStageTeamsCount}
                  onChange={e => setNextStageTeamsCount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                >
                  <option value={4}>Top 4</option>
                  <option value={8}>Top 8</option>
                  <option value={16}>Top 16</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowNextStageModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleGenerateNextStage}
                className="flex-1 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-lg shadow-purple-500/30"
              >
                Tạo Vòng Mới
              </button>
            </div>
          </div>
        </div>
      )}
` + match
        );
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

injectNextStage('FrontEnd/FrontendReact/src/pages/captain/ManageTournament_Captain.jsx');
injectNextStage('FrontEnd/FrontendReact/src/pages/owner/ManageTournament_Owner.jsx');
