import React, { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminControlPlaneSuite } from "../AdminControlPlaneSuite";
import "../../../src/index.css";
import "./styles.css";

function AdminConsoleApp() {
  const [notice, setNotice] = useState(null);
  const onNotify = useCallback((message, type = "info") => {
    setNotice({ message: String(message), type });
  }, []);

  return (
    <div className="hendy-admin-standalone">
      <header className="hendy-admin-topbar">
        <a className="hendy-admin-brand" href="/" aria-label="Hendy Studio home">
          <span className="hendy-admin-brand-icon"><ShieldCheck size={20} /></span>
          <span><strong>HENDY</strong><small>ADMIN CONTROL PLANE</small></span>
        </a>
        <div className="hendy-admin-topbar-right">
          <span className="hendy-admin-live"><Activity size={14} /> Control Plane</span>
          <a className="hendy-admin-studio-link" href="/studio.html"><ArrowLeft size={15} /> Mở Studio</a>
        </div>
      </header>
      <main className="hendy-admin-main">
        <section className="hendy-admin-heading">
          <div>
            <p className="hendy-admin-eyebrow">TẦNG 0 · QUẢN TRỊ HỆ THỐNG</p>
            <h1>Hendy Admini</h1>
            <p className="hendy-admin-description">Quản lý vận hành, phân quyền và các dịch vụ hạ tầng từ một giao diện riêng.</p>
          </div>
          <span className="hendy-admin-security-note"><ShieldCheck size={16} /> Bảo vệ API phía máy chủ</span>
        </section>
        {notice && (
          <div className={`hendy-admin-notice is-${notice.type}`} role="status">
            <span>{notice.message}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Đóng thông báo">×</button>
          </div>
        )}
        <AdminControlPlaneSuite onNotify={onNotify} />
      </main>
      <footer className="hendy-admin-footer">Hendy Studio Pro · Admin UI độc lập · Không thay thế chính sách xác thực phía server.</footer>
    </div>
  );
}

const mount = document.getElementById("root");
if (mount) createRoot(mount).render(<React.StrictMode><AdminConsoleApp /></React.StrictMode>);
