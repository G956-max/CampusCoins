import React, { useState } from 'react';
import { Image, FileText, Video, Download, ExternalLink, Eye, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { cn } from '../../utils/cn';

const EvidenceGallery = ({ evidence = [], className }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#647168] rounded-xl bg-[#F7FAF7] border border-[#E1E9E2]">
        No photo or document evidence attached to this ticket.
      </div>
    );
  }

  const getIcon = (type = '') => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    return FileText;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {evidence.map((item, idx) => {
          const isImage = item.file_type?.startsWith('image/') || item.file_url?.startsWith('data:image/');
          const isVideo = item.file_type?.startsWith('video/');
          const Icon = getIcon(item.file_type);

          return (
            <div
              key={item.id || idx}
              className="p-3 rounded-xl bg-white border border-[#E1E9E2] flex flex-col justify-between gap-3 group hover:border-[#168451]/40 shadow-xs transition-all"
            >
              {/* Preview Thumbnail */}
              {isImage ? (
                <div
                  onClick={() => setSelectedImage(item.file_url)}
                  className="relative h-32 w-full rounded-lg overflow-hidden bg-[#F7FAF7] border border-[#E1E9E2] cursor-pointer group/thumb"
                >
                  <img
                    src={item.file_url}
                    alt="Complaint Evidence"
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-[#17211B]/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="p-2 rounded-full bg-white text-[#17211B] shadow-md">
                      <Eye size={18} />
                    </span>
                  </div>
                </div>
              ) : isVideo ? (
                <div className="h-32 w-full rounded-lg overflow-hidden bg-[#F7FAF7] border border-[#E1E9E2] flex flex-col items-center justify-center text-[#647168] gap-2">
                  <Video size={32} className="text-[#168451]" />
                  <span className="text-[11px] font-medium">Video Evidence</span>
                </div>
              ) : (
                <div className="h-32 w-full rounded-lg overflow-hidden bg-[#F7FAF7] border border-[#E1E9E2] flex flex-col items-center justify-center text-[#647168] gap-2">
                  <FileText size={32} className="text-[#168451]" />
                  <span className="text-[11px] font-medium">PDF Document</span>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[#647168] font-mono text-[11px] truncate max-w-[150px]">
                  {item.file_type || 'Attachment'}
                </span>

                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1 text-[#168451] hover:text-[#116B42] font-semibold"
                >
                  <Download size={13} />
                  <span>Open</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Image Preview Modal */}
      <Modal
        isOpen={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        title="Evidence Preview"
        maxWidth="max-w-3xl"
        footer={
          <Button variant="primary" size="sm" onClick={() => setSelectedImage(null)}>
            Close
          </Button>
        }
      >
        {selectedImage && (
          <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-[#F7FAF7] border border-[#E1E9E2] p-2">
            <img
              src={selectedImage}
              alt="Full Preview"
              className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EvidenceGallery;
