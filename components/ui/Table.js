import { cn } from "@/lib/utils";

export default function Table({ columns, data, className }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm text-left text-text-main">
        <thead className="text-xs text-text-muted uppercase bg-gray-50 dark:bg-border/30 border-b border-border">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-border hover:bg-gray-50/50 dark:hover:bg-border/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}