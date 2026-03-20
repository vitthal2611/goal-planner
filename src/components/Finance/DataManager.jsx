import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import toast from 'react-hot-toast';

export default function DataManager() {
  const { user } = useAuthStore();
  const { transactions, paymentMethods, envelopes, importData, exportToJSON } = useFinanceStore();

  const handleExport = () => {
    const data = exportToJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('✅ Data exported successfully!');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        importData(data, user.uid);
        toast.success('✅ Data imported successfully!');
      } catch (error) {
        toast.error('❌ Invalid JSON file');
        console.error(error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="data-manager">
      <div className="data-info-box">
        <div className="data-info-title">💾 Backup & Restore</div>
        <div className="data-info-text">
          Export your data as JSON for backup or import to restore/merge data.
        </div>
        <div className="data-stats">
          📊 {transactions.length} transactions • 
          💳 {paymentMethods.length} payment methods • 
          📁 {envelopes.length} categories
        </div>
      </div>

      <div className="data-actions">
        <button className="data-export-btn" onClick={handleExport}>
          📥 Export Data (JSON)
        </button>
        
        <label className="data-import-btn">
          📤 Import Data (JSON)
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="data-warning">
        ⚠️ Import merges with existing data — no data loss
      </div>
    </div>
  );
}
