import { useState, useEffect } from 'react';

const IntroModal = () => {
    // State to control visibility of the intro modal
    const [showIntro, setShowIntro] = useState(true);

    // Check localStorage on component mount
    useEffect(() => {
        const hasSkippedIntro = localStorage.getItem('skipNeuralIntro');
        if (hasSkippedIntro === 'true') {
            setShowIntro(false);
        }
    }, []);

    // Function to hide intro and optionally remember the choice
    const hideIntro = (remember = false) => {
        setShowIntro(false);
        if (remember) {
            localStorage.setItem('skipNeuralIntro', 'true');
        }
    };

    return (
        <>
            {/* Intro Modal */}
            {showIntro && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: 'rgba(16, 20, 30, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid #3b4a6b',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 0 30px rgba(0, 255, 170, 0.3)',
                        textAlign: 'center',
                    }}>
                        <h1 style={{
                            color: '#e0e0e0',
                            fontSize: '1.8rem',
                            marginBottom: '20px',
                            fontFamily: 'Courier New, monospace',
                            textShadow: '0 0 10px rgba(0, 255, 170, 0.5)',
                        }}>Neural Portfolio</h1>

                        <p style={{
                            color: '#c0c0c0',
                            fontSize: '1rem',
                            marginBottom: '25px',
                            lineHeight: '1.5',
                            fontFamily: 'Courier New, monospace',
                        }}>
                            Explore my projects by interacting with the neural network nodes.
                            Click on any node to view detailed project information.
                        </p>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button
                                onClick={() => hideIntro(true)}
                                style={{
                                    backgroundColor: 'rgba(0, 255, 170, 0.1)',
                                    border: '1px solid #00ffaa',
                                    borderRadius: '4px',
                                    padding: '10px 20px',
                                    color: '#00ffaa',
                                    fontFamily: 'Courier New, monospace',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 170, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 255, 170, 0.4)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 170, 0.1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                DON'T SHOW AGAIN
                            </button>

                            <button
                                onClick={() => hideIntro(false)}
                                style={{
                                    backgroundColor: 'rgba(180, 160, 140, 0.1)',
                                    border: '1px solid rgba(180, 160, 140, 0.5)',
                                    borderRadius: '4px',
                                    padding: '10px 20px',
                                    color: 'rgba(200, 175, 155, 0.9)',
                                    fontFamily: 'Courier New, monospace',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = 'rgba(180, 160, 140, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(180, 160, 140, 0.2)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = 'rgba(180, 160, 140, 0.1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                CONTINUE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Show Intro Button - Always visible when modal is closed */}
            {!showIntro && (
                <button
                    onClick={() => setShowIntro(true)}
                    style={{
                        position: 'fixed',
                        top: '80px',
                        right: '20px',
                        backgroundColor: 'rgba(10, 10, 18, 0.85)',
                        border: '1px solid #3b4a6b',
                        borderRadius: '8px',
                        padding: '8px 15px',
                        color: 'rgba(200, 175, 155, 0.9)',
                        fontFamily: 'Courier New, monospace',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        zIndex: 150,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(20, 20, 30, 0.95)';
                        e.currentTarget.style.borderColor = 'rgba(200, 175, 155, 0.5)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(180, 160, 140, 0.25)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(10, 10, 18, 0.85)';
                        e.currentTarget.style.borderColor = '#3b4a6b';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <span style={{
                        backgroundColor: 'rgba(200, 175, 155, 0.15)',
                        borderRadius: '4px',
                        padding: '3px 5px',
                        marginRight: '5px',
                    }}>?</span>
                    SHOW INTRO
                </button>
            )}
        </>
    );
};

export default IntroModal;