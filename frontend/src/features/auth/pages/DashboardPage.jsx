import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, LogOut, Users } from "lucide-react";
import { authApi } from "../service/auth.api.js";
import { useAuth } from "../hook/useAuth.js";

function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    if (user.role !== "admin") return;

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
    <main className="[min-height:100vh] [background:var(--paper)]">
      <header className="[display:flex] [height:76px] [align-items:center] [justify-content:space-between] [padding:0_clamp(24px,_6vw,_92px)] [border-bottom:1px_solid_var(--line)] [background:#fff] max-[700px]:[height:66px] max-[700px]:[padding:0_18px]">
        <a
          className="[display:inline-flex] [align-items:center] [gap:10px] [text-decoration:none] [font-size:13px] [font-weight:800] [letter-spacing:1.2px] [font-family:'Manrope',_sans-serif]"
          href="/dashboard"
        >
          <span className="[display:grid] [width:34px] [height:34px] [place-items:center] [border:1px_solid_#dce4dc] [border-radius:50%] [color:var(--green)]">
            <Activity size={19} strokeWidth={2.5} />
          </span>
          <span>HERTZ CLUB</span>
        </a>
        <div className="[display:flex] [align-items:center] [gap:14px] max-[700px]:[gap:8px]">
          <span className="[padding:5px_8px] [border-radius:3px] [background:#e9efdf] [color:var(--green)] [font-size:9px] [font-weight:800] [letter-spacing:1px] [text-transform:uppercase]">
            {user.role}
          </span>
          <span className="[color:#53605b] [font-size:13px] max-[700px]:[max-width:100px] max-[700px]:[overflow:hidden] max-[700px]:[text-overflow:ellipsis] max-[700px]:[white-space:nowrap]">
            {user.name}
          </span>
          <button
            aria-label="Sign out"
            className="[display:inline-grid] [width:38px] [height:38px] [place-items:center] [border:0] [border-radius:50%] [background:transparent] [color:#687570] [cursor:pointer] [&:hover]:[background:#edf0eb] [&:hover]:[color:var(--green-dark)] [border:1px_solid_var(--line)]"
            onClick={logout}
            title="Sign out"
            type="button"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="[width:min(100%_-_48px,_1080px)] [margin:0_auto] [padding:76px_0] max-[700px]:[width:min(100%_-_36px,_1080px)] max-[700px]:[padding:46px_0]">
        <div className="[display:flex] [align-items:end] [justify-content:space-between] [gap:24px] [margin-bottom:42px] max-[700px]:[align-items:start] max-[700px]:[flex-direction:column] max-[700px]:[margin-bottom:28px]">
          <div>
            <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px]">
              {user.role === "admin" ? "ADMIN" : "MEMBER"} AREA
            </p>
            <h1 className="[margin:0] [font-size:44px] [line-height:1.14] [font-family:'Manrope',_sans-serif] max-[700px]:[font-size:34px]">
              Good to see you, {user.name.split(" ")[0]}.
            </h1>
            <p className="[margin:12px_0_0] [color:var(--muted)] [font-size:14px]">
              {user.role === "admin"
                ? "Your club overview is ready."
                : "Your Hertz Club account is ready for the road."}
            </p>
          </div>
          <span className="[display:inline-flex] [align-items:center] [gap:8px] [padding-bottom:5px] [color:#697670] [font-size:9px] [font-weight:700] [letter-spacing:1.2px] [white-space:nowrap] max-[700px]:[padding:0]">
            <span className="[width:7px] [height:7px] [border-radius:50%] [background:#62a766] [box-shadow:0_0_0_4px_#e1eedf]" />{" "}
            ACCOUNT ACTIVE
          </span>
        </div>

        {user.role === "admin" ? (
          <section className="[border-top:1px_solid_var(--line)] [border-bottom:1px_solid_var(--line)] [background:rgba(255,255,255,.62)] [padding:27px_clamp(20px,_3vw,_36px)]">
            <div className="[display:flex] [align-items:center] [gap:14px] [padding-bottom:24px] max-[700px]:[flex-wrap:wrap]">
              <div className="[display:grid] [width:42px] [height:42px] [flex:0_0_42px] [place-items:center] [border-radius:50%] [background:#e9efdf] [color:var(--green)]">
                <Users size={20} />
              </div>
              <div>
                <h2 className="[margin:0] [font-size:18px] [font-family:'Manrope',_sans-serif]">
                  Club members
                </h2>
                <p className="[margin:4px_0_0] [color:var(--muted)] [font-size:12px]">
                  Accounts registered with Hertz Club
                </p>
              </div>
              <span className="[margin-left:auto] [color:var(--muted)] [font-size:9px] [font-weight:700] [letter-spacing:1px] max-[700px]:[width:100%] max-[700px]:[margin-left:56px]">
                {users.length} MEMBERS
              </span>
            </div>
            {usersError ? (
              <p
                className="[margin-bottom:18px] [padding:12px_14px] [border-left:3px_solid_var(--red)] [background:#f9e9e5] [color:#812f25] [font-size:13px]"
                role="alert"
              >
                {usersError}
              </p>
            ) : (
              <div className="[overflow-x:auto] [border-top:1px_solid_var(--line)]">
                <table className="[width:100%] [border-collapse:collapse] [text-align:left] [font-size:12px]">
                  <thead>
                    <tr>
                      <th className="[padding:15px_12px_12px] [color:#8b9690] [font-size:9px] [letter-spacing:1px]">
                        MEMBER
                      </th>
                      <th className="[padding:15px_12px_12px] [color:#8b9690] [font-size:9px] [letter-spacing:1px]">
                        EMAIL
                      </th>
                      <th className="[padding:15px_12px_12px] [color:#8b9690] [font-size:9px] [letter-spacing:1px]">
                        ROLE
                      </th>
                      <th className="[padding:15px_12px_12px] [color:#8b9690] [font-size:9px] [letter-spacing:1px]">
                        JOINED
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((member) => (
                      <tr key={member.id}>
                        <td className="[padding:14px_12px] [border-top:1px_solid_#e9ece8] [color:#4d5a54] [white-space:nowrap] [&:first-child]:[color:var(--ink)] [&:first-child]:[font-weight:700]">
                          {member.name}
                        </td>
                        <td className="[padding:14px_12px] [border-top:1px_solid_#e9ece8] [color:#4d5a54] [white-space:nowrap] [&:first-child]:[color:var(--ink)] [&:first-child]:[font-weight:700]">
                          {member.email}
                        </td>
                        <td className="[padding:14px_12px] [border-top:1px_solid_#e9ece8] [color:#4d5a54] [white-space:nowrap] [&:first-child]:[color:var(--ink)] [&:first-child]:[font-weight:700]">
                          <span className="[padding:4px_7px] [border-radius:3px] [background:#e9efdf] [color:var(--green)] [font-size:8px] [font-weight:800] [letter-spacing:1px] [text-transform:uppercase]">
                            {member.role}
                          </span>
                        </td>
                        <td className="[padding:14px_12px] [border-top:1px_solid_#e9ece8] [color:#4d5a54] [white-space:nowrap] [&:first-child]:[color:var(--ink)] [&:first-child]:[font-weight:700]">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          className="[padding:14px_12px] [border-top:1px_solid_#e9ece8] [color:#4d5a54] [white-space:nowrap] [&:first-child]:[color:var(--ink)] [&:first-child]:[font-weight:700] [padding:24px_12px] [color:var(--muted)] [text-align:center]"
                          colSpan="4"
                        >
                          No members yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="[border-top:1px_solid_var(--line)] [border-bottom:1px_solid_var(--line)] [background:rgba(255,255,255,.62)] [display:flex] [align-items:center] [justify-content:space-between] [min-height:210px] [padding:36px_clamp(24px,_4vw,_55px)] max-[700px]:[min-height:190px] max-[700px]:[padding:25px_20px]">
            <div>
              <p className="[margin:0_0_13px] [color:var(--green)] [font-size:10px] [font-weight:700] [letter-spacing:1.8px] [&:last-child]:[margin:9px_0_0] [&:last-child]:[color:var(--muted)] [&:last-child]:[font-size:13px]">
                MEMBERSHIP
              </p>
              <h2 className="[margin:0] [font-size:23px] [font-family:'Manrope',_sans-serif] max-[700px]:[max-width:240px] max-[700px]:[font-size:21px]">
                Your membership
              </h2>
              <p className="[&:last-child]:[margin:9px_0_0] [&:last-child]:[color:var(--muted)] [&:last-child]:[font-size:13px]">
                Your membership is active.
              </p>
            </div>
            <span className="[display:grid] [width:48px] [height:48px] [place-items:center] [border:1px_solid_#cad7cd] [border-radius:50%] [color:var(--green)]">
              <ArrowUpRight size={23} />
            </span>
          </section>
        )}
      </section>
    </main>
  );
}

export { DashboardPage };
