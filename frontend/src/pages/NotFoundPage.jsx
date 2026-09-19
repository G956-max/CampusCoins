import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-campus-400 mx-auto shadow-inner">
          <Compass size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white">404</h1>
          <h2 className="text-lg font-bold text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page or campus facility route you are trying to reach does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft size={16} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
