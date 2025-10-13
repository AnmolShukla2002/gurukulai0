// src/lib/mock-data.ts

export interface Student {
    id: number;
    name: string;
    scores: {
      math: number;
      science: number;
      history: number;
      english: number;
    };
  }
  
  const names = [
    'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi',
    'Ivan', 'Judy', 'Kevin', 'Linda', 'Mallory', 'Nancy', 'Oscar', 'Peggy',
    'Quentin', 'Romeo', 'Samantha', 'Trent', 'Ulysses', 'Victor', 'Wendy',
    'Xavier', 'Yvonne', 'Zelda', 'Adam', 'Bertha', 'Charles', 'Diana', 'Edward',
    'Fiona', 'George', 'Hannah', 'Ian', 'Jane', 'Ken', 'Laura', 'Mike', 'Nora'
  ];
  
  const generateRandomScore = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  const createStudentData = (count: number, grade: number): Student[] => {
    const students: Student[] = [];
    for (let i = 1; i <= count; i++) {
      students.push({
        id: i,
        name: `${names[i-1]} G${grade}`,
        scores: {
          math: generateRandomScore(60, 95),
          science: generateRandomScore(55, 98),
          history: generateRandomScore(65, 99),
          english: generateRandomScore(70, 92),
        },
      });
    }
    return students;
  };
  
  export const grade9Data = createStudentData(40, 9);
  export const grade10Data = createStudentData(40, 10);
  
  export const classAverages = (data: Student[]) => {
    const totals = data.reduce((acc, student) => {
      acc.math += student.scores.math;
      acc.science += student.scores.science;
      acc.history += student.scores.history;
      acc.english += student.scores.english;
      return acc;
    }, { math: 0, science: 0, history: 0, english: 0 });
  
    return [
      { subject: 'Math', average: Math.round(totals.math / data.length) },
      { subject: 'Science', average: Math.round(totals.science / data.length) },
      { subject: 'History', average: Math.round(totals.history / data.length) },
      { subject: 'English', average: Math.round(totals.english / data.length) },
    ];
  };
  
  export const scoreDistribution = (data: Student[], subject: keyof Student['scores']) => {
    const distribution = [
      { range: '90-100', count: 0 },
      { range: '80-89', count: 0 },
      { range: '70-79', count: 0 },
      { range: '60-69', count: 0 },
      { range: '<60', count: 0 },
    ];
    data.forEach(student => {
      const score = student.scores[subject];
      if (score >= 90) distribution[0].count++;
      else if (score >= 80) distribution[1].count++;
      else if (score >= 70) distribution[2].count++;
      else if (score >= 60) distribution[3].count++;
      else distribution[4].count++;
    });
    return distribution;
  };
  
  export const predictiveData = (data: Student[]) => {
    const currentAverages = classAverages(data);
    return currentAverages.map(subject => ({
      subject: subject.subject,
      current: subject.average,
      predicted: Math.min(100, Math.round(subject.average * (1 + (Math.random() * 0.1 + 0.05)))), // Predict a 5-15% improvement
    }));
  };
  