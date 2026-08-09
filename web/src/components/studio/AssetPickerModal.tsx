import { useState, useRef } from "react";
import { asset } from "../../lib/asset";

interface AssetPickerModalProps {
  currentUrl?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

const PRESET_GALLERY = [
  { url: "images/slide-debate.jpg", label: "Học sinh thảo luận" },
  { url: "images/slide-overview.jpg", label: "Tổng quan bài học" },
  { url: "images/slide-animals.jpg", label: "Minh họa toán học" },
  { url: "images/slide-pedestrian.jpg", label: "Biển báo giao thông" },
  { url: "images/sgk-animals.jpg", label: "Hình thú SGK" },
  { url: "images/sgk-debate-prime.jpg", label: "Tranh luận số học" },
  { url: "images/sgk-redlight.jpg", label: "Tình huống đèn đỏ" },
  { url: "images/sgk-forall.jpg", label: "Lượng từ ∀ ∃" },
  { url: "images/bai2/venn-islands.jpg", label: "Sơ đồ Đảo Venn" },
  { url: "images/bai2/history-club.jpg", label: "Club Lịch sử" },
  { url: "images/bai3/cinema.jpg", label: "Rạp Chiếu Phim" },
  { url: "images/bai3/halfplane.jpg", label: "Miền nghiệm mặt phẳng" },
];

export function AssetPickerModal({ currentUrl = "", onSelect, onClose }: AssetPickerModalProps) {
  const [tab, setTab] = useState<"upload" | "gallery" | "url">("upload");
  const [customUrl, setCustomUrl] = useState(currentUrl);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Đọc file thành data URL
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setLoading(false);
      if (typeof reader.result === "string") {
        onSelect(reader.result);
        onClose();
      }
    };
    reader.onerror = () => {
      setLoading(false);
      alert("Không đọc được file ảnh.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card asset-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Chọn hoặc Tải hình ảnh</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="studio-tabs" style={{ margin: "0.75rem 0" }}>
          <button
            type="button"
            className={`studio-tab ${tab === "upload" ? "is-active" : ""}`}
            onClick={() => setTab("upload")}
          >
            📁 Tải ảnh từ máy
          </button>
          <button
            type="button"
            className={`studio-tab ${tab === "gallery" ? "is-active" : ""}`}
            onClick={() => setTab("gallery")}
          >
            🖼️ Thư viện ảnh mẫu
          </button>
          <button
            type="button"
            className={`studio-tab ${tab === "url" ? "is-active" : ""}`}
            onClick={() => setTab("url")}
          >
            🔗 Dán link ảnh
          </button>
        </div>

        <div className="asset-tab-content">
          {tab === "upload" && (
            <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileUpload}
              />
              <div className="upload-icon">📷</div>
              <strong>Bấm để chọn file ảnh từ máy tính</strong>
              <p>Hỗ trợ JPG, PNG, WebP, SVG (ảnh sẽ tự động tối ưu hiển thị)</p>
              {loading && <p style={{ color: "var(--accent)" }}>Đang nạp ảnh...</p>}
            </div>
          )}

          {tab === "gallery" && (
            <div className="gallery-grid">
              {PRESET_GALLERY.map((item) => (
                <div
                  key={item.url}
                  className={`gallery-item ${currentUrl.includes(item.url) ? "is-selected" : ""}`}
                  onClick={() => {
                    onSelect(asset(item.url));
                    onClose();
                  }}
                >
                  <img src={asset(item.url)} alt={item.label} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "url" && (
            <div className="url-form">
              <label>
                Đường link ảnh trực tiếp (URL):
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  style={{ width: "100%", marginTop: "0.4rem", padding: "0.5rem" }}
                />
              </label>
              {customUrl && (
                <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                  <img
                    src={customUrl}
                    alt="Xem trước"
                    style={{ maxHeight: "140px", borderRadius: "6px", maxWidth: "100%" }}
                  />
                </div>
              )}
              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button type="button" className="btn btn--ghost" onClick={onClose}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    if (customUrl.trim()) {
                      onSelect(customUrl.trim());
                      onClose();
                    }
                  }}
                >
                  Xác nhận dùng ảnh này
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
