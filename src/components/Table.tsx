import { useTable } from 'react-table';
import { KeychainItem } from './Keychain';

type TableProps = {
  data: KeychainItem[];
  count: number;
  openModal: (arg0: KeychainItem) => void;
};

const columns = [
  {
    Header: 'Persistent Reference',
    accessor: 'persistref',
  },
  {
    Header: 'Group',
    accessor: 'agrp',
  },
  {
    Header: 'Label',
    accessor: 'labl',
  },
  {
    Header: 'Creation Date',
    accessor: 'cdat',
  },
  {
    Header: 'Modification Date',
    accessor: 'mdat',
  },
];

function Table({ data, count, openModal }: TableProps) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<KeychainItem>({
    columns,
    data,
  });

  return (
    <>
      <span className="editable-count px-2">
        {data.length} editable out of {count}
      </span>

      <table {...getTableProps()} className="table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
              <th></th>
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                })}
                <td align="right">
                  <button onClick={() => openModal(data[index])} type="button" className="btn btn-primary">
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default Table;
