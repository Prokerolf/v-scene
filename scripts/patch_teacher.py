import re

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add 'allocation' to the union type
content = content.replace(
    "const [activeTab, setActiveTab] = useState<'monitoring' | 'approval' | 'bug_reports'>('monitoring');",
    "const [activeTab, setActiveTab] = useState<'monitoring' | 'approval' | 'bug_reports' | 'allocation'>('allocation');"
)

# 2. Add 'waitingUsers' state and 'allocateStudents' function
allocation_logic = """
  const [waitingUsers, setWaitingUsers] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'allocation') {
      fetchWaitingUsers();
    }
  }, [activeTab]);

  const fetchWaitingUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const waiting: any[] = [];
      usersSnap.forEach(doc => {
        const data = doc.data();
        if (data.role === 'student' && data.hasCompletedPretest && !data.allocatedCaseId) {
          waiting.push({ id: doc.id, ...data });
        }
      });
      setWaitingUsers(waiting);
    } catch (err) {
      console.error(err);
    }
  };

  const allocateStudents = async () => {
    if (waitingUsers.length === 0) return alert('No waiting students');
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const caseOptions = ['case_a', 'case_b', 'case_c'];
      
      let counts = { 'case_a': 0, 'case_b': 0, 'case_c': 0 };
      
      // Try to distribute them evenly
      waitingUsers.forEach((user, idx) => {
        // Just round-robin for simplicity
        const assignedBaseCase = caseOptions[idx % 3];
        const assignedTier = user.triageTiers?.[assignedBaseCase] || 'Low';
        const finalCaseId = `${assignedBaseCase}_${assignedTier.toLowerCase()}`;
        
        batch.update(doc(db, 'users', user.id), {
          allocatedCaseId: finalCaseId
        });
      });
      
      await batch.commit();
      alert('Allocated ' + waitingUsers.length + ' students successfully!');
      fetchWaitingUsers();
    } catch (e: any) {
      alert('Error allocating: ' + e.message);
    }
    setLoading(false);
  };
"""

content = content.replace("const [studentFilter, setStudentFilter] = useState<'all' | 'needs_help'>('all');", "const [studentFilter, setStudentFilter] = useState<'all' | 'needs_help'>('all');\n" + allocation_logic)


# 3. Add Allocation button in the sidebar
nav_btn = """
          <li>
            <button 
              onClick={() => setActiveTab('allocation')}
              className={`w-full flex items-center gap-4 py-3 rounded-r-full mr-4 px-6 transition-all ${
                activeTab === 'allocation' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded">group_add</span>
              <span className="font-label-md whitespace-nowrap">Allocation</span>
              {waitingUsers.length > 0 && (
                <span className="bg-primary text-on-primary text-xs px-2 py-0.5 rounded-full ml-auto">{waitingUsers.length}</span>
              )}
            </button>
          </li>
"""

content = content.replace("<li>\n            <button \n              onClick={() => setActiveTab('monitoring')", nav_btn + "\n          <li>\n            <button \n              onClick={() => setActiveTab('monitoring')")


# 4. Add Allocation tab content
tab_content = """
          {activeTab === 'allocation' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden mb-8 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-headline-md text-2xl text-on-surface">Student Allocation</h3>
                  <p className="font-body-md text-on-surface-variant mt-2">There are {waitingUsers.length} students waiting in the lobby after completing their pre-test.</p>
                </div>
                <button 
                  onClick={allocateStudents}
                  disabled={waitingUsers.length === 0 || loading}
                  className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  <span className="material-symbols-rounded">shuffle</span>
                  Batch Allocate Now
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant">Student ID</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant">Case A Score (Tier)</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant">Case B Score (Tier)</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant">Case C Score (Tier)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingUsers.map(user => (
                      <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 border-b border-outline-variant font-bold">{user.username || user.id}</td>
                        <td className="px-6 py-4 border-b border-outline-variant">{user.pretestScores?.case_a} ({user.triageTiers?.case_a})</td>
                        <td className="px-6 py-4 border-b border-outline-variant">{user.pretestScores?.case_b} ({user.triageTiers?.case_b})</td>
                        <td className="px-6 py-4 border-b border-outline-variant">{user.pretestScores?.case_c} ({user.triageTiers?.case_c})</td>
                      </tr>
                    ))}
                    {waitingUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-on-surface-variant">No students are currently waiting.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
"""

content = content.replace("{activeTab === 'monitoring' && (", tab_content + "\n          {activeTab === 'monitoring' && (")


with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(content)

print("TeacherDashboard updated.")
