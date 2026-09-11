/**
 * Data table for list screens (members, memberships, payments).
 *
 * Columns describe what to render; rows carry the data. A column renders
 * `row[column.key]` by default, or `column.render(row)` for custom cells
 * (badges, formatted dates, row actions). Styling comes from design tokens
 * only (`surface` background, hairline `line` borders, `fog` header text);
 * soft grey shadows are never used (FF-DU).
 *
 * @typedef {object} TableColumn
 * @property {string} TableColumn.key Stable column id; also the default row field read.
 * @property {string} TableColumn.header Visible header label (Spanish UI copy).
 * @property {(row: Record<string, unknown>) => import("react").ReactNode} [TableColumn.render] Custom cell renderer; defaults to the raw `row[key]` value.
 *
 * @param {object} props
 * @param {TableColumn[]} props.columns Column definitions.
 * @param {Record<string, unknown>[]} props.rows Data rows.
 * @param {(row: Record<string, unknown>, index: number) => string | number} props.keyOf Maps a row to its React key.
 * @param {string} [props.caption] Accessible table description (visually hidden).
 * @param {string} [props.className=""] Extra classes appended after the kit classes.
 */
export default function Table({
  columns,
  rows,
  keyOf,
  caption,
  className = "",
}) {
  return (
    <div
      className={["overflow-x-auto rounded-card border border-line", className]
        .filter(Boolean)
        .join(" ")}
    >
      <table className="w-full border-collapse bg-surface text-left text-body-md text-paper">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-4 py-2.5 text-body-sm font-medium text-fog"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={keyOf(row, index)}
              className="border-b border-line last:border-b-0"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-2.5 align-top">
                  {column.render
                    ? column.render(row)
                    : (row[column.key] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
