function ErrorAlert({ title, body }: { title: string, body: string }) {
    return (
        <>
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">{title}</h4>
                    <p>{body}</p>
                </div>
            </div>
        </>
    )
}

export default ErrorAlert