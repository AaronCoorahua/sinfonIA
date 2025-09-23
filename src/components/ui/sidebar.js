"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar as ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  FiHome,
  FiTarget,
  FiMusic,
  FiHeadphones,
  FiAward,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";

export default function Sidebar() {
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user]);

  const [attrs, setAttrs] = useState({ sub: "", name: "", email: "" });
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false); // móvil (overlay)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const a = await fetchUserAttributes();
        setAttrs({
          sub: a?.sub || "",
          name: a?.name || "",
          email: a?.email || user?.username || "",
        });
      } catch {
        setAttrs({
          sub: "",
          name: user?.attributes?.name || "",
          email: user?.attributes?.email || user?.username || "",
        });
      }
    })();
  }, [user]);

  const fullName = attrs.name || attrs.email || "Usuario";
  const initial = (fullName?.trim()?.charAt(0) || "U").toUpperCase();

  const width = "270px";
  const collapsedWidth = "80px";

  return (
    <>
      {/* Botón hamburguesa para abrir en móvil */}
      {isMobile && !toggled && (
        <button
          aria-label="Abrir menú"
          onClick={() => setToggled(true)}
          className="fixed top-3 left-3 z-[60] rounded-lg p-2 bg-black/60 text-white border border-white/10 hover:bg-black/80"
        >
          <FiMenu size={20} />
        </button>
      )}

      <ProSidebar
        collapsed={collapsed && !isMobile}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        breakPoint="md"
        width={width}
        collapsedWidth={collapsedWidth}
        backgroundColor="#121826"
        transitionDuration={250}
        rootStyles={
          isMobile
            ? {
                position: "fixed",
                left: 0,
                top: 0,
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid rgba(255,255,255,0.1)",
                color: "#e8eefc",
                zIndex: 55,
              }
            : {
                /* Desktop: keep sidebar in document flow so it pushes the main content */
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                color: "#e8eefc",
                zIndex: 1,
              }
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            {!collapsed && (
              <>
                <img src="/logo.png" alt="SinfonIA" className="h-7 w-7" />
                <span className="text-sm font-semibold">SinfonIA</span>
              </>
            )}
            {collapsed && (
              // cuando está colapsado, ocultamos el logo/label
              <span className="w-7 h-7 inline-block" />
            )}
          </div>

          {isMobile ? (
            <button
              aria-label="Cerrar menú"
              onClick={() => setToggled(false)}
              className="rounded p-2 hover:bg-white/10"
            >
              <FiX size={18} />
            </button>
          ) : (
            <button
              aria-label={collapsed ? "Expandir" : "Colapsar"}
              onClick={() => setCollapsed((c) => !c)}
              className="rounded p-2 hover:bg-white/10"
            >
              {collapsed ? (
                <FiChevronRight size={18} />
              ) : (
                <FiChevronLeft size={18} />
              )}
            </button>
          )}
        </div>

        {/* Menú principal */}
        <Menu
          closeOnClick
          menuItemStyles={{
            button: {
              color: "#e8eefc",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
            },
            icon: { color: "#e8eefc" },
          }}
        >
          <MenuItem icon={<FiHome />} component={<Link href="/home" />}>
            Inicio
          </MenuItem>
          <MenuItem icon={<FiTarget />} component={<Link href="/compete" />}>
            Competir
          </MenuItem>
          <MenuItem icon={<FiMusic />} component={<Link href="/instruments" />}>
            Instrumentos
          </MenuItem>
          <MenuItem icon={<FiHeadphones />} component={<Link href="/songs" />}>
            Canciones
          </MenuItem>
          <MenuItem icon={<FiAward />} component={<Link href="/ranking" />}>
            Ranking
          </MenuItem>
        </Menu>

        {/* Empuja el footer al fondo */}
        <div className="mt-auto" />

        {/* Footer: usuario + acciones (siempre abajo) */}
        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar con inicial */}
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E07A2F", color: "#ffffff" }}
              aria-label={`Avatar de ${fullName}`}
              title={fullName}
            >
              <span className="font-semibold">{initial}</span>
            </div>

            {/* Datos usuario (ocultos si colapsado) */}
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{fullName}</p>
                <p className="text-xs text-gray-300/80 truncate">
                  {attrs.email}
                </p>
              </div>
            )}
          </div>

          {/* Botones Perfil + Cerrar sesión */}
          <div
            className={`flex ${collapsed ? "flex-col gap-2" : "flex-col gap-2"}`}
          >
            <Link
              href={attrs.sub ? `/profile/${attrs.sub}` : "/profile"}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              <FiUser />
              {!collapsed && <span>Perfil</span>}
            </Link>

            <button
              onClick={signOut}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              <FiLogOut />
              {!collapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </div>
      </ProSidebar>

      {/* Overlay en móvil cuando está abierto */}
      {isMobile && toggled && (
        <div
          onClick={() => setToggled(false)}
          className="fixed inset-0 bg-black/50 z-[50]"
        />
      )}
    </>
  );
}
