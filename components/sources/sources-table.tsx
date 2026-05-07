"use client";

import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import type { SourceDomainRow } from "./types";

type SourcesTableProps = {
  rows: SourceDomainRow[];
  workspaceSlug: string;
  selectedDomain?: string;
};

function formatGrowth(value: number | null) {
  if (value === null) {
    return "--";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;
}

export function SourcesTable({ rows, workspaceSlug, selectedDomain }: SourcesTableProps) {
  const [type, setType] = useQueryState("type", parseAsString.withDefault("all"));
  const filteredRows = rows.filter((row) => {
    if (type === "owned") {
      return row.isOwned;
    }

    if (type === "third-party") {
      return !row.isOwned;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "Todas" },
          { value: "owned", label: "Propias" },
          { value: "third-party", label: "Terceros" },
        ].map((option) => (
          <button
            className={
              type === option.value
                ? "rounded-full bg-foreground px-4 py-2 font-medium text-background text-sm"
                : "rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            }
            key={option.value}
            type="button"
            onClick={() => void setType(option.value === "all" ? null : option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-black/10 border-b bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 font-medium">Domain</th>
                <th className="px-4 py-3 font-medium">Citations</th>
                <th className="px-4 py-3 font-medium">Growth %</th>
                <th className="px-4 py-3 font-medium">Owned?</th>
                <th className="px-4 py-3 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr
                    className="border-black/5 border-b last:border-0 dark:border-white/10"
                    key={row.domain}
                  >
                    <td className="px-4 py-4">
                      <Link
                        className={
                          selectedDomain === row.domain
                            ? "font-semibold underline"
                            : "font-medium hover:underline"
                        }
                        href={`/${workspaceSlug}/sources?domain=${encodeURIComponent(row.domain)}${type !== "all" ? `&type=${type}` : ""}`}
                      >
                        {row.domain}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{row.citations.toLocaleString("es-ES")}</td>
                    <td className="px-4 py-4">{formatGrowth(row.growthPct)}</td>
                    <td className="px-4 py-4">{row.isOwned ? "Si" : "No"}</td>
                    <td className="px-4 py-4 text-muted-foreground">{row.lastSeen ?? "--"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-12 text-center text-muted-foreground" colSpan={5}>
                    No hay sources para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
