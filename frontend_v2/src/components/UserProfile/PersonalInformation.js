import { useState } from "react";

export default function PersonnelInformation() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  return (
    <div style={{ padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '1.5rem', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'space-between', flexWrap: 'wrap', flexDirection: 'row' }}>
        <div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2d3748', marginBottom: '1.5rem' }}>
            Informations Personnelles
          </h4>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#718096' }}>
                Prénom
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#2d3748' }}>
                DevTest
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: '#718096' }}>
                Nom
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#2d3748' }}>
                DevTest
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: '#718096' }}>
                Adresse Email
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#2d3748' }}>
                sales@mc-solution.fr
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: '#718096' }}>
                Téléphone
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#2d3748' }}>
                (+33) 757 69 20 02
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: '#718096' }}>
                Organisation
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#2d3748' }}>
                MC Solution
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '9999px',
            padding: '0.75rem 1rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            color: '#4a5568',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#f7fafc')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#ffffff')}
        >
          Modifier
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '700px',
            overflowY: 'auto',
            position: 'relative',
            backgroundColor: '#ffffff',
            borderRadius: '1.5rem',
            padding: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginTop: '0.5rem',
            transition: 'max-height 0.3s ease-in-out',
          }}>
            <div style={{ paddingRight: '3.5rem' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>
                Modifier les informations personnelles
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1.5rem' }}>
                Mettez à jour vos informations pour garder votre profil à jour.
              </p>
            </div>
            <form style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '0 0.5rem', paddingBottom: '0.75rem' }}>
                <div style={{ marginTop: '1.75rem' }}>
                  <h5 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#2d3748', marginBottom: '1.5rem' }}>
                    Informations Personnelles
                  </h5>

                  <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ gridColumn: 'span 1' }}>
                      <label style={{ fontSize: '0.875rem', color: '#4a5568' }}>Prénom</label>
                      <input
                        type="text"
                        defaultValue="DevTest"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#f7fafc',
                          color: '#2d3748',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label style={{ fontSize: '0.875rem', color: '#4a5568' }}>Nom</label>
                      <input
                        type="text"
                        defaultValue="DevTest"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#f7fafc',
                          color: '#2d3748',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label style={{ fontSize: '0.875rem', color: '#4a5568' }}>Adresse Email</label>
                      <input
                        type="email"
                        defaultValue="sales@mc-solution.fr"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#f7fafc',
                          color: '#2d3748',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 1' }}>
                      <label style={{ fontSize: '0.875rem', color: '#4a5568' }}>Téléphone</label>
                      <input
                        type="text"
                        defaultValue="(+33) 757 69 20 02"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#f7fafc',
                          color: '#2d3748',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.875rem', color: '#4a5568' }}>Organisation</label>
                      <input
                        type="text"
                        defaultValue="MC Solution"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#f7fafc',
                          color: '#2d3748',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '0 0.5rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#4a5568',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#3182ce',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}