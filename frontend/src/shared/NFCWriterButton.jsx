import React, { useState } from 'react';

export default function NFCWriterButton({ url }) {
  const [status, setStatus] = useState('');

  const handleWriteNFC = async () => {
    if (!('NDEFWriter' in window)) {
      setStatus('Tu dispositivo o navegador no soporta escritura NFC.');
      return;
    }

    try {
      const writer = new NDEFWriter();
      setStatus('Acerca el tag NFC al dispositivo...');
      await writer.write({ records: [{ recordType: "url", data: url }] });
      setStatus('✅ Link grabado correctamente en el NFC.');
    } catch (error) {
      console.error(error);
      setStatus('❌ Error al escribir el tag. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button className="button" onClick={handleWriteNFC}>Escribir link en NFC</button>
      {status && <p className="small" style={{marginTop:8}}>{status}</p>}
    </div>
  );
}
