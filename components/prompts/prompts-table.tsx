"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { updatePromptStatusAction } from "@/lib/actions/prompts";
import { cn } from "@/lib/utils";
import type { PromptTableRow } from "./types";

type PromptsTableProps = {
  rows: PromptTableRow[];
  workspaceSlug: string;
};

const statusLabels: Record<PromptTableRow["status"], string> = {
  active: "Activo",
  paused: "Pausado",
  archived: "Archivado",
};

const sentimentLabels: Record<NonNullable<PromptTableRow["sentiment"]>, string> = {
  positive: "Positivo",
  neutral: "Neutral",
  negative: "Negativo",
};

function formatPct(value: number | null) {
  return value === null ? "--" : `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;
}

export function PromptsTable({ rows, workspaceSlug }: PromptsTableProps) {
  const [country, setCountry] = useQueryState("country", parseAsString.withDefault(""));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
  const [tag, setTag] = useQueryState("tag", parseAsString.withDefault(""));

  const countries = useMemo(
    () => Array.from(new Set(rows.map((row) => row.country))).sort(),
    [rows],
  );
  const tags = useMemo(
    () => Array.from(new Set(rows.flatMap((row) => row.tags))).sort((a, b) => a.localeCompare(b)),
    [rows],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const countryMatch = country ? row.country === country : true;
        const statusMatch = status ? row.status === status : true;
        const tagMatch = tag ? row.tags.includes(tag) : true;
        return countryMatch && statusMatch && tagMatch;
      }),
    [country, rows, status, tag],
  );

  const columns = useMemo<ColumnDef<PromptTableRow>[]>(
    () => [
      {
        header: "Rank",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "text",
        header: "Prompt",
        cell: ({ row }) => (
          <Link
            className="font-medium hover:underline"
            href={`/${workspaceSlug}/prompts/${row.original.id}`}
          >
            {row.original.text}
          </Link>
        ),
      },
      {
        header: "Position",
        cell: ({ row }) => (row.original.brandPosition ? `#${row.original.brandPosition}` : "--"),
      },
      {
        header: "SOV",
        cell: ({ row }) => formatPct(row.original.sovPct),
      },
      {
        header: "Sentiment",
        cell: ({ row }) =>
          row.original.sentiment ? sentimentLabels[row.original.sentiment] : "--",
      },
      {
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex max-w-60 flex-wrap gap-1">
            {row.original.tags.length > 0 ? (
              row.original.tags.map((rowTag) => (
                <span
                  className="rounded-full bg-black/5 px-2 py-1 text-xs dark:bg-white/10"
                  key={rowTag}
                >
                  {rowTag}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">--</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "country",
        header: "Country",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={cn(
              "rounded-full px-2 py-1 font-medium text-xs",
              row.original.status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
            )}
          >
            {statusLabels[row.original.status]}
          </span>
        ),
      },
      {
        header: "BC%",
        cell: ({ row }) => formatPct(row.original.brandConsistencyPct),
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          if (row.original.status === "archived") {
            return <span className="text-muted-foreground text-sm">Archivado</span>;
          }

          const nextStatus = row.original.status === "active" ? "paused" : "active";

          return (
            <form action={updatePromptStatusAction}>
              <input name="promptId" type="hidden" value={row.original.id} />
              <input name="workspaceSlug" type="hidden" value={workspaceSlug} />
              <input name="status" type="hidden" value={nextStatus} />
              <button className="font-medium text-sm hover:underline" type="submit">
                {nextStatus === "active" ? "Activar" : "Pausar"}
              </button>
            </form>
          );
        },
      },
    ],
    [workspaceSlug],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <select
          className="h-11 rounded-xl border border-black/10 bg-transparent px-3 text-sm dark:border-white/15"
          value={country}
          onChange={(event) => void setCountry(event.target.value || null)}
        >
          <option value="">Todos los paises</option>
          {countries.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="h-11 rounded-xl border border-black/10 bg-transparent px-3 text-sm dark:border-white/15"
          value={status}
          onChange={(event) => void setStatus(event.target.value || null)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="paused">Pausado</option>
          <option value="archived">Archivado</option>
        </select>

        <select
          className="h-11 rounded-xl border border-black/10 bg-transparent px-3 text-sm dark:border-white/15"
          value={tag}
          onChange={(event) => void setTag(event.target.value || null)}
        >
          <option value="">Todos los tags</option>
          {tags.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-black/10 border-b bg-black/[0.02] text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th className="px-4 py-3 font-medium" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    className="border-black/5 border-b last:border-0 dark:border-white/10"
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td className="px-4 py-4 align-top" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-12 text-center text-muted-foreground"
                    colSpan={columns.length}
                  >
                    No hay prompts que coincidan con los filtros.
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
