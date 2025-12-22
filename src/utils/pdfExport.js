import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const exportGoalsAndHabitsToPDF = (goals, habits, logs) => {
  const doc = new jsPDF();
  let yPosition = 20;
  
  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Goals & Habits Report', 20, yPosition);
  yPosition += 15;
  
  // Date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 20, yPosition);
  yPosition += 20;
  
  goals.forEach((goal, goalIndex) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Goal Title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`${goalIndex + 1}. ${goal.title}`, 20, yPosition);
    yPosition += 10;
    
    // Goal Details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const progress = goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0;
    
    doc.text(`Target: ${goal.yearlyTarget} ${goal.unit}`, 25, yPosition);
    yPosition += 6;
    doc.text(`Progress: ${goal.actualProgress} / ${goal.yearlyTarget} (${Math.round(progress)}%)`, 25, yPosition);
    yPosition += 6;
    
    if (goal.startDate && goal.endDate) {
      doc.text(`Duration: ${format(new Date(goal.startDate), 'MMM d, yyyy')} - ${format(new Date(goal.endDate), 'MMM d, yyyy')}`, 25, yPosition);
      yPosition += 6;
    }
    
    // Linked Habits
    const linkedHabits = habits.filter(habit => habit.goalIds?.includes(goal.id));
    
    if (linkedHabits.length > 0) {
      yPosition += 5;
      doc.setFont(undefined, 'bold');
      doc.text('Linked Habits:', 25, yPosition);
      yPosition += 8;
      
      linkedHabits.forEach((habit, habitIndex) => {
        doc.setFont(undefined, 'normal');
        doc.text(`${habitIndex + 1}. ${habit.name}`, 30, yPosition);
        yPosition += 6;
        doc.text(`   Time: ${habit.time} | Trigger: ${habit.trigger}`, 30, yPosition);
        yPosition += 6;
        doc.text(`   Location: ${habit.location}`, 30, yPosition);
        yPosition += 6;
        
        // Habit consistency (last 30 days)
        const habitLogs = logs.filter(log => log.habitId === habit.id).slice(-30);
        const completed = habitLogs.filter(log => log.status === 'done').length;
        const consistency = habitLogs.length > 0 ? Math.round((completed / habitLogs.length) * 100) : 0;
        
        doc.text(`   30-day consistency: ${consistency}%`, 30, yPosition);
        yPosition += 10;
      });
    } else {
      yPosition += 5;
      doc.setFont(undefined, 'italic');
      doc.text('No habits linked to this goal', 25, yPosition);
      yPosition += 10;
    }
    
    yPosition += 10; // Space between goals
  });
  
  // Summary at the end
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }
  
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Goals: ${goals.length}`, 25, yPosition);
  yPosition += 6;
  doc.text(`Total Habits: ${habits.length}`, 25, yPosition);
  yPosition += 6;
  
  const avgProgress = goals.length > 0 ? 
    goals.reduce((sum, goal) => sum + (goal.yearlyTarget > 0 ? (goal.actualProgress / goal.yearlyTarget) * 100 : 0), 0) / goals.length : 0;
  doc.text(`Average Goal Progress: ${Math.round(avgProgress)}%`, 25, yPosition);
  
  // Save the PDF
  const fileName = `goals-habits-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};