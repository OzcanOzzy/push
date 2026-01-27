import Link from "next/link";

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-links">
          <Link href="/">Menü</Link>
          <Link href="/">Tüm İlanlar</Link>
          <Link href="/firsatlar">Fırsatlar</Link>
          <Link href="/requests/customer?type=SELL">Hakkımızda</Link>
          <Link href="/requests/customer?type=SELL">İletişim</Link>
        </div>
        <div className="topbar-links">
          <span>WhatsApp</span>
          <span>+90 543 306 14 99</span>
          <span>emlaknomiozcan@gmail.com</span>
        </div>
      </div>
    </div>
  );
}
