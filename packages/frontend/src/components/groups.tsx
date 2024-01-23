/**
 *
 *
 * @export
 * @interface GroupsComponentProps
 * @typedef {GroupsComponentProps}
 */
export interface GroupsComponentProps {
  /**
   *
   *
   * @type {{ [id: string]: bigint[] }}
   */
  groups: { [id: string]: bigint[] };
}

/**
 *
 *
 * @export
 * @param {GroupsComponentProps} { groups }
 * @returns {*}
 */
export function Groups({ groups }: GroupsComponentProps) {
  return (
    <>
      {Object.entries(groups).map(([id, keys], idx) => (
        <details className="mx-5" key={id}>
          <summary className="text-base font-semibold">
            Group {idx + 1} ({id})
          </summary>

          <div className="flex flex-col border border-gray-300 divide-y divide-gray-300">
            {keys.map((key) => (
              <span className="break-all px-2 py-1" key={key.toString(16)}>
                {key.toString(16)}
              </span>
            ))}
          </div>
        </details>
      ))}
    </>
  );
}
