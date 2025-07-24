import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminUploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    setError('');
    setPreview(null);
    const f = e.target.files[0];
    setFile(f);
    if (!f) return;
    if (!f.name.endsWith('.json')) {
      setError('Please upload a JSON file.');
      return;
    }
    try {
      const text = await f.text();
      const data = JSON.parse(text);
      setPreview(data);
    } catch (err) {
      setError('Invalid JSON file.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-deep-900 bg-white">
      <motion.div
        className="glass rounded-2xl p-8 w-full max-w-lg flex flex-col gap-6 items-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className="text-2xl font-poppins font-bold text-accent-500 mb-2 text-center">
          Admin Timetable Upload
        </h1>
        <p className="text-light-200 text-center mb-4">
          Upload a new timetable JSON file to preview its structure.
        </p>
        <input
          type="file"
          accept=".json"
          className="block w-full text-sm text-light-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-600 file:text-white hover:file:bg-accent-700"
          onChange={handleFile}
        />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {preview && (
          <div className="w-full max-h-64 overflow-auto bg-deep-800 rounded-xl p-4 mt-2 text-xs text-light-100">
            <pre>{JSON.stringify(preview, null, 2)}</pre>
          </div>
        )}
      </motion.div>
    </div>
  );
} 