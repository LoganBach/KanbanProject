import React from 'react'
import '../../styles/login.css'
import { faThLarge } from '@fortawesome/free-solid-svg-icons/faThLarge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function TitledContainer({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="container titled-container my-5">
                <div className="mx-auto p-4 bg-white rounded shadow">
                    <a id="titleLogo" className="navbar-brand fw-bold fs-1 mb-2">
                        <FontAwesomeIcon icon={faThLarge} className="me-2 fs-1" />
                        KanbanOnline
                    </a>
                    {children}
                </div>
            </div>
        </>
    )
}

export default TitledContainer