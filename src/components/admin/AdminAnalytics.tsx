import {
  Activity,
  BarChart3,
  Eye,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchAnalyticsDashboard,
  subscribeToAnalytics,
} from "../../lib/analytics";
import { assetUrl } from "../../lib/assets";
import { formatNumber } from "../../lib/format";
import type { AnalyticsDashboardData } from "../../types";

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  timeZone: "Asia/Jakarta",
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function analyticsDate(date: string) {
  return new Date(`${date}T12:00:00+07:00`);
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setData(await fetchAnalyticsDashboard());
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Data analitik tidak dapat dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void fetchAnalyticsDashboard()
      .then((nextData) => {
        if (active) {
          setData(nextData);
          setError("");
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Data analitik tidak dapat dimuat.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = subscribeToAnalytics(
      (nextData) => {
        if (active) {
          setData(nextData);
          setError("");
        }
      },
      (reason) => {
        if (active) setError(reason.message);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const maximumViews = useMemo(
    () => Math.max(...(data?.daily.map((point) => point.views) ?? [0]), 1),
    [data?.daily],
  );

  if (loading) {
    return (
      <section className="analytics-dashboard" aria-live="polite">
        <div className="analytics-heading">
          <div>
            <p className="analytics-heading__eyebrow">Analitik Situs</p>
            <h2>Memuat aktivitas pengunjung…</h2>
          </div>
        </div>
        <div className="analytics-loading">
          <div className="loading-mark" aria-hidden="true" />
          <p>Mengambil statistik terbaru dari database.</p>
        </div>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="analytics-dashboard">
        <div className="analytics-heading">
          <div>
            <p className="analytics-heading__eyebrow">Analitik Situs</p>
            <h2>Statistik belum dapat dimuat</h2>
            <span>{error}</span>
          </div>
          <button
            className="button button--ghost button--small"
            type="button"
            onClick={() => void load()}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Coba lagi
          </button>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const tiles = [
    {
      label: "Total View",
      value: data.totalViews,
      detail: "Semua halaman publik",
      icon: Eye,
      tone: "blue",
    },
    {
      label: "Pengunjung Unik",
      value: data.uniqueVisitors,
      detail: "Estimasi browser/perangkat",
      icon: Users,
      tone: "purple",
    },
    {
      label: "View Hari Ini",
      value: data.viewsToday,
      detail: `${formatNumber(data.visitorsToday)} pengunjung hari ini`,
      icon: BarChart3,
      tone: "cyan",
    },
    {
      label: "Aktif Sekarang",
      value: data.activeVisitors,
      detail: "Aktif dalam 5 menit terakhir",
      icon: Activity,
      tone: "green",
    },
  ];

  return (
    <section className="analytics-dashboard" aria-labelledby="analytics-title">
      <div className="analytics-heading">
        <div>
          <p className="analytics-heading__eyebrow">Analitik Situs</p>
          <h2 id="analytics-title">Aktivitas pengunjung</h2>
          <span>
            Data nyata sejak analitik diaktifkan, diperbarui otomatis.
          </span>
        </div>
        <div className="analytics-live" role="status">
          <i aria-hidden="true" />
          Realtime
        </div>
      </div>

      {error ? (
        <div className="analytics-warning" role="status">
          <span>{error}</span>
          <button type="button" onClick={() => void load()}>
            Muat ulang
          </button>
        </div>
      ) : null}

      <div className="analytics-tiles">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <article key={tile.label}>
              <div className={`analytics-tiles__icon is-${tile.tone}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <div>
                <p>{tile.label}</p>
                <strong>{formatNumber(tile.value)}</strong>
                <span>{tile.detail}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="analytics-panels">
        <section className="admin-panel analytics-chart-panel">
          <div className="admin-panel__heading">
            <div>
              <h3>View 7 Hari Terakhir</h3>
              <p>Perbandingan view harian dalam zona waktu Jakarta.</p>
            </div>
          </div>
          <div
            className="analytics-chart"
            role="img"
            aria-label="Grafik view situs tujuh hari terakhir"
          >
            {data.daily.map((point) => {
              const date = analyticsDate(point.date);
              const height = (point.views / maximumViews) * 100;
              const style = {
                "--analytics-bar-height": `${height}%`,
              } as CSSProperties;

              return (
                <div
                  className="analytics-chart__column"
                  key={point.date}
                  title={`${dateFormatter.format(date)}: ${formatNumber(point.views)} view, ${formatNumber(point.visitors)} pengunjung`}
                >
                  <span>{formatNumber(point.views)}</span>
                  <div className="analytics-chart__track">
                    <i style={style} aria-hidden="true" />
                  </div>
                  <strong>{dayFormatter.format(date)}</strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="admin-panel analytics-trending-panel">
          <div className="admin-panel__heading">
            <div>
              <h3>Skrip Trending</h3>
              <p>Peringkat berdasarkan view aktual 7 hari terakhir.</p>
            </div>
            <TrendingUp size={19} aria-hidden="true" />
          </div>
          {data.trending.length ? (
            <ol className="analytics-trending">
              {data.trending.map((script, index) => (
                <li key={script.id}>
                  <span className="analytics-trending__rank">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <img src={assetUrl(script.thumbnail)} alt="" />
                  <div>
                    <a href={`#/skrip/${script.slug}`}>{script.title}</a>
                    <p>{script.game}</p>
                  </div>
                  <div className="analytics-trending__metric">
                    <strong>{formatNumber(script.views7d)}</strong>
                    <span>{formatNumber(script.visitors7d)} unik</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="analytics-empty">
              <Eye size={24} aria-hidden="true" />
              <div>
                <h4>Belum ada view skrip</h4>
                <p>
                  Skrip akan masuk peringkat setelah halaman detailnya dibuka.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
