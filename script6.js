const fs = require('fs');
const captainPath = 'd:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/captain/TournamentsTab.jsx';
const ownerPath = 'd:/FInd_Op_Web_Project/FindFootballOppsites/FrontEnd/FrontendReact/src/pages/owner/OwnerTournamentsTab.jsx';

let captain = fs.readFileSync(captainPath, 'utf8');
let owner = fs.readFileSync(ownerPath, 'utf8');

owner = owner.replace(
  "import { FiPlus, FiCalendar, FiUsers, FiSettings, FiX } from 'react-icons/fi';",
  "import { FiPlus, FiCalendar, FiUsers, FiSettings, FiX, FiUploadCloud, FiCheckCircle } from 'react-icons/fi';\nimport Swal from 'sweetalert2';"
);

owner = owner.replace(
    "const [showCreateModal, setShowCreateModal] = useState(false);\n  const [formData, setFormData] = useState({\n    name: '',\n    sport: 'Bóng đá',\n    stadium: '',\n    format: 'League',\n    scope: 'Internal', // Internal (Nội bộ), Public (Mở rộng)\n    entryFee: 0,\n    maxTeams: 8,\n    assignmentType: 'Manual', // Manual, Random\n    maxPlayersPerTeam: 5,\n    startDate: '',\n    endDate: '',\n    agreeTerms: false,\n  });",
    `const [showCreateModal, setShowCreateModal] = useState(false);
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sportId: 1,
    stadium: '',
    format: 'League',
    scope: 'Internal', 
    entryFee: 0,
    maxTeams: 8,
    assignmentType: 'Manual', 
    maxPlayersPerTeam: 5,
    startDate: '',
    endDate: '',
    phone: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    bankQrCodeUrl: '',
    agreeTerms: false,
  });`
);

owner = owner.replace(
  /const handleCreateSubmit = async \(e\) => \{[\\s\SS]*?^  \};/m,
  `const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const form = new FormData();
      form.append('file', file);
      const res = await stadiumOwnerService.uploadMedia(form);
      const url = res.url || res;
      setFormData(prev => (; ...prev, [field]: url }));
    } catch (err) {
      Swal.fire('Lỗi', 'Không thể upload ảnh, vui lòng thử lại.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const selectPackage = (teams, fee) => {
    setFormData(prev => ({ ...prev, maxTeams: teams, entryFee: fee }));
    setStep(2);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (step === 2) {
      if (formData.scope === 'Internal') {
        await submitTournament();
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!formData.agreeTerms) {
        Swal.fire('Chú ý', 'Vui lòng đồng ý với các điều khO�an.', 'warning');
        return;
      }
      if (!formData.phone || !formData.idCardFrontUrl || !formData.idCardBackUrl) {
        Swal.fire('Chú ý', 'Vui lòng cung cấp đầy đủ thông tin KYC (SĐT, mẵt trước, mặt sau CCCD).', 'warning');
        return;
      }
      await submitTournament();
    }
  };

  const submitTournament = async () => {
    setIsSubmitting(true);
    try {
      if (!formData.stadium) {
        Swal.fire('Chú ý', 'Vui lòng chọn sân thi đấu.', 'warning');
        return;
      }
      const res = await stadiumOwnerService.createTournament(formData);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        const msg = formData.scope === 'Internal' ? 'Tạo giải đấu nội bộ thành công!' : 'Tạo giải đầu thành công! Chờ Admin duyệt.';
        Swal.fire('Thành công', msg, 'success');
        setShowCreateModal(false);
        setStep(1);
        fetchData();
      }
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || err.message || 'Không thễ tạo giải đầu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };`
);

owner = owner.replace(
  "onClick={() => setShowCreateModal(true)}",
  "onClick={() => { setShowCreateModal(true); setStep(1); }}"
);

const capStart = captain.indexOf('y/* MODAL T');
let capEnd = captain.indexOf('document.body', capStart);
capEnd = captain.indexOf(')', capEnd) + 1;
const modalBlock = captain.substring(capStart, capEnd);


const ownStart = owner.indexOf('{/* MODAL T');
let ownEnd = owner.indexOf('document.body', ownStart);
ownEnd = owner.indexOf(')', ownEnd) + 1;

let newOwner = owner.substring(0, ownStart) + modalBlock + owner.substring(ownEnd);

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

newOwner = newOwner.replace('<option value="GroupStage">Vòng b�ng (Group Stage)</option>\n                            </select>\n                          </div>', '<option value="GroupStage">Vòng b�ng (Group Stage)</option>\n                            </select>\n                          </div>\n' + stadiumSelect);

fs.writeFileSync(ownerPath, newOwner, 'utf8');
console.log('Success!');