import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  responsive?: boolean;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  className,
  striped = false,
  hover = false,
  bordered = false,
  responsive = true,
}: TableProps<T>) {
  const TableComponent = (
    <table
      className={cn(
        "table",
        striped && "table-striped",
        hover && "table-hover",
        bordered && "table-bordered",
        className
      )}
    >
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} className={column.className}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center text-muted py-4">
              No data available
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={column.className}>
                  {typeof column.accessor === "function"
                    ? column.accessor(row)
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  if (responsive) {
    return <div className="table-responsive">{TableComponent}</div>;
  }

  return TableComponent;
}
