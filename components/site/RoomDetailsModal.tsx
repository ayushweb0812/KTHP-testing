"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Room, roomsApi } from '@/lib/api/rooms';
import { Ornament } from './Ornament';
import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { getRoomPrice, formatPrice } from "@/lib/utils/pricing";

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number | null;
}

export function RoomDetailsModal({ isOpen, onClose, roomId }: RoomDetailsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && roomId) {
      setShow(true);
      setImgIdx(0);
      document.body.style.overflow = 'hidden';
      
      setLoading(true);
      setError("");
      roomsApi.getRoomById(roomId).then(res => {
        if (res.success && res.room) {
          setRoom(res.room);
        } else {
          setError("Failed to load room details.");
        }
        setLoading(false);
      }).catch(err => {
        setError("Error loading room details.");
        setLoading(false);
      });

    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setShow(false);
        setRoom(null);
        setError("");
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, roomId]);

  if (!mounted || (!isOpen && !show)) return null;

  const images = room?.images && room.images.length > 0 ? room.images : (room ? ["/heritage/rooms/1.webp"] : []);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />
      
      <div className={`relative bg-[var(--card)] border border-[var(--gold)]/40 shadow-[var(--shadow-royal)] w-full max-w-4xl max-h-[90vh] flex flex-col rounded-sm transition-all duration-300 transform ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--maroon)] hover:text-[var(--gold)] transition-colors z-10 bg-card/80 p-1 rounded-full backdrop-blur-sm"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="overflow-y-auto flex-1 scrollbar-thin" data-lenis-prevent="true">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[var(--gold)] tracking-[0.28em] uppercase text-xs">Loading Details...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-[var(--maroon)]">
              {error}
            </div>
          ) : room ? (
            <>
              {/* Images Section */}
              <div className="relative aspect-[4/3] sm:aspect-[21/9] bg-[var(--maroon-deep)] group">
                {images.length > 0 && (
                  <img src={images[imgIdx]} alt={room.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.06_258/0.8)] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 text-parchment">
                  <h2 className="text-display text-4xl">{room.name}</h2>
                </div>
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-parchment/90 hover:bg-[var(--gold)] text-[var(--maroon-deep)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="Previous image">‹</button>
                    <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-parchment/90 hover:bg-[var(--gold)] text-[var(--maroon-deep)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="Next image">›</button>
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-[oklch(0.14_0.06_258/0.7)] text-parchment text-[10px] tracking-[0.2em] backdrop-blur-sm rounded">{imgIdx + 1} / {images.length}</div>
                  </>
                )}
              </div>

              <div className="p-6 md:p-8">
                {images.length > 1 && (
                  <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
                    {images.map((src, i) => (
                      <button key={src + i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-24 aspect-video overflow-hidden border-2 transition-all ${imgIdx === i ? "border-[var(--gold)] opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <Ornament className="w-12 text-[var(--gold)] mb-4" />
                    <h3 className="text-display text-2xl text-[var(--maroon)] mb-4">About this room</h3>
                    <div className="space-y-4 text-sm font-serif text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {room.description || "No description available."}
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-[var(--gold)]/5 border border-[var(--gold)]/20 p-6 rounded-sm">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--maroon)] mb-4">Key Details</p>
                      <ul className="space-y-3 text-sm font-serif text-foreground/80">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" /> Sleeps {room.capacity}
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" /> {room.bed_type}
                        </li>
                      </ul>
                      
                      {room.features && room.features.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-[var(--gold)]/20">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--maroon)] mb-4">Amenities</p>
                          <ul className="space-y-2">
                            {room.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2 text-sm font-serif text-foreground/80">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[oklch(0.5_0.13_150)] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-8 pt-6 border-t border-[var(--gold)]/20">
                        <div className="text-display text-3xl gold-text mb-1">{formatPrice(getRoomPrice(room))}</div>
                        <p className="text-[11px] text-muted-foreground mb-6">per night · taxes extra</p>
                        <Link href={`/book/${room.id}`} className="block w-full text-center px-6 py-3 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-colors shadow-[var(--shadow-gold)]">
                          Reserve →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
