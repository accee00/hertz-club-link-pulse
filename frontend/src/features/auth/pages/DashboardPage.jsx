import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, LogOut, Users } from 'lucide-react';
import { authApi } from '../service/auth.api.js';
import { useAuth } from '../hook/useAuth.js';

function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    if (user.role !== 'admin') return;

    let active = true;
    authApi
      .adminUsers(token)
      .then((response) => {
        if (active) setUsers(response.data.users);
      })
      .catch((error) => {
        if (active) setUsersError(error.message);
      });

    return () => {
      active = false;
    };
  }, [token, user.role]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <a className="brand dashboard-brand" href="/dashboard">
          <span className="brand-mark">
            <Activity size={19} strokeWidth={2.5} />
          </span>
          <span>HERTZ CLUB</span>
        </a>
        <div className="account-menu">
          <span className="role-label">{user.role}</span>
          <span className="account-name">{user.name}</span>
          <button
            aria-label="Sign out"
            className="icon-button logout-button"
            onClick={logout}
            title="Sign out"
            type="button"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="dashboard-main">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">{user.role === 'admin' ? 'ADMIN' : 'MEMBER'} AREA</p>
            <h1>Good to see you, {user.name.split(' ')[0]}.</h1>
            <p className="dashboard-subtitle">
              {user.role === 'admin'
                ? 'Your club overview is ready.'
                : 'Your Hertz Club account is ready for the road.'}
            </p>
          </div>
          <span className="status-indicator">
            <span /> ACCOUNT ACTIVE
          </span>
        </div>

        {user.role === 'admin' ? (
          <section className="admin-section">
            <div className="section-title-row">
              <div className="section-icon">
                <Users size={20} />
              </div>
              <div>
                <h2>Club members</h2>
                <p>Accounts registered with Hertz Club</p>
              </div>
              <span className="member-count">{users.length} MEMBERS</span>
            </div>
            {usersError ? (
              <p className="dashboard-error" role="alert">{usersError}</p>
            ) : (
              <div className="member-table-wrap">
                <table className="member-table">
                  <thead>
                    <tr>
                      <th>MEMBER</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>JOINED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.email}</td>
                        <td><span className="table-role">{member.role}</span></td>
                        <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td className="empty-table" colSpan="4">No members yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="member-welcome">
            <div className="welcome-copy">
              <p className="eyebrow">YOUR CLUB, AT A GLANCE</p>
              <h2>Every journey starts somewhere.</h2>
              <p>Your membership is active. We’re glad you’re here.</p>
            </div>
            <span className="welcome-arrow"><ArrowUpRight size={23} /></span>
          </section>
        )}
      </section>
    </main>
  );
}

export { DashboardPage };