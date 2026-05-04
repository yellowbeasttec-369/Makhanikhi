import React from 'react';
import { ServiceRequest } from '../types';
import { Calendar as CalendarIcon, Clock, Car, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface CalendarViewProps {
  requests: ServiceRequest[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ requests }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getJobsForDay = (day: number) => {
    return requests.filter(req => {
      if (!req.appointmentDate) return false;
      const date = new Date(req.appointmentDate);
      return (
        date.getDate() === day &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="bento-card overflow-hidden">
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
        <div className="bento-card-title p-0"><div className="bento-dot"></div> SERVICE SCHEDULE</div>
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-technic-yellow">{monthName} {currentDate.getFullYear()}</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-white/5 group">
              <ChevronLeft className="w-4 h-4 group-hover:text-technic-yellow transition-colors" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-white/5 group">
              <ChevronRight className="w-4 h-4 group-hover:text-technic-yellow transition-colors" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden mb-8">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="p-3 text-[10px] font-black text-text-dim text-center bg-industrial-charcoal/50">
            {day}
          </div>
        ))}
        
        {padding.map(i => (
          <div key={`pad-${i}`} className="aspect-square p-2 bg-industrial-charcoal/30 flex items-start justify-end text-[10px] text-white/10" />
        ))}
        
        {days.map(day => {
          const jobs = getJobsForDay(day);
          const isToday = day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear();
          
          return (
            <div 
              key={day} 
              className={`aspect-square p-2 border-t border-l border-white/5 transition-all flex flex-col items-end gap-1 relative group ${
                isToday ? 'bg-technic-yellow/5' : 'bg-industrial-charcoal/50'
              }`}
            >
              <span className={`text-[10px] font-bold ${isToday ? 'text-technic-yellow' : 'text-text-dim group-hover:text-white'}`}>
                {day}
              </span>
              
              {jobs.length > 0 && (
                <div className="flex flex-wrap gap-0.5 justify-end mt-1">
                  {jobs.map((job, i) => (
                    <div 
                      key={job.id || i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        job.status === 'completed' ? 'bg-success-green' : 
                        job.status === 'in-progress' ? 'bg-technic-yellow animate-pulse' : 
                        'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[2px] text-text-dim ml-2">Upcoming Events</h4>
        {requests
          .filter(r => r.appointmentDate && new Date(r.appointmentDate) >= new Date())
          .sort((a, b) => new Date(a.appointmentDate!).getTime() - new Date(b.appointmentDate!).getTime())
          .slice(0, 3)
          .map(req => (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-technic-yellow">{(new Date(req.appointmentDate!).toLocaleString('default', { month: 'short' }) || '').toUpperCase()}</span>
                  <span className="text-sm font-black">{new Date(req.appointmentDate!).getDate()}</span>
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase tracking-tight">{req.vehicleMake} {req.vehicleModel}</h5>
                  <div className="flex items-center gap-3 mt-1 text-[9px] text-text-dim font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(req.appointmentDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</span>
                  </div>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`text-[8px] uppercase ${
                  req.status === 'in-progress' ? 'border-technic-yellow text-technic-yellow' : 'border-white/10 text-white/50'
                }`}
              >
                {req.status.replace('-', ' ')}
              </Badge>
            </motion.div>
          ))}
          
        {requests.filter(r => r.appointmentDate && new Date(r.appointmentDate) >= new Date()).length === 0 && (
          <div className="p-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/10">
            <CalendarIcon className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">No upcoming appointments</p>
          </div>
        )}
      </div>
    </div>
  );
};
