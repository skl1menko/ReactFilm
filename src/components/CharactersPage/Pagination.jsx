import './Pagination.css';
import { setPage } from '../../features/characters/charactersSlice';

const Pagination = ({ dispatch, currentPage }) => {
    const handlePageClick = (page) => {
        dispatch(setPage(page));
    };

    const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const totalPages = pageNumbers.length;

    return (
        <div className="pagination">
            <button
                className="page-button nav-button"
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ←
            </button>
            
            {pageNumbers.map((page) => (
                <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`page-button ${currentPage === page ? 'active' : ''}`}
                >
                    {page}
                </button>
            ))}

            <button
                className="page-button nav-button"
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                →
            </button>
        </div>
    );
};

export default Pagination;