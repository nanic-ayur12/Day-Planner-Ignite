import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updatePassword 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  writeBatch,
  getDocs,
  query,
  where 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Event, EventPlan, Brigade, Submission } from '@/types';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Check if admin already exists
    const adminQuery = query(collection(db, 'users'), where('email', '==', 'admin@ignite.edu'));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (!adminSnapshot.empty) {
      console.log('Admin user already exists, skipping seeding');
      return;
    }

    // Create admin user
    const adminCredential = await createUserWithEmailAndPassword(auth, 'admin@ignite.edu', 'admin123');
    const adminUser: User = {
      id: adminCredential.user.uid,
      email: 'admin@ignite.edu',
      name: 'Admin User',
      role: 'ADMIN',
      createdAt: new Date(),
      isActive: true
    };
    await setDoc(doc(db, 'users', adminCredential.user.uid), adminUser);

    // Create brigades
    const brigades = [
      { name: 'Alpha Brigade', id: 'alpha' },
      { name: 'Beta Brigade', id: 'beta' },
      { name: 'Gamma Brigade', id: 'gamma' },
      { name: 'Delta Brigade', id: 'delta' },
      { name: 'Epsilon Brigade', id: 'epsilon' }
    ];

    const batch = writeBatch(db);
    
    for (const brigade of brigades) {
      const brigadeData: Brigade = {
        id: brigade.id,
        name: brigade.name,
        createdAt: new Date(),
        isActive: true
      };
      batch.set(doc(db, 'brigades', brigade.id), brigadeData);
    }

    // Create sample students
    const students = [
      { rollNumber: 'CS2021001', name: 'John Doe', brigade: 'alpha' },
      { rollNumber: 'CS2021002', name: 'Jane Smith', brigade: 'beta' },
      { rollNumber: 'CS2021003', name: 'Mike Johnson', brigade: 'gamma' },
      { rollNumber: 'CS2021004', name: 'Sarah Wilson', brigade: 'delta' },
      { rollNumber: 'CS2021005', name: 'David Brown', brigade: 'epsilon' },
      { rollNumber: 'CS2021006', name: 'Emily Davis', brigade: 'alpha' },
      { rollNumber: 'CS2021007', name: 'Chris Miller', brigade: 'beta' },
      { rollNumber: 'CS2021008', name: 'Lisa Garcia', brigade: 'gamma' },
      { rollNumber: 'CS2021009', name: 'Tom Anderson', brigade: 'delta' },
      { rollNumber: 'CS2021010', name: 'Amy Taylor', brigade: 'epsilon' }
    ];

    for (const student of students) {
      try {
        const studentCredential = await createUserWithEmailAndPassword(
          auth, 
          `${student.rollNumber}@student.ignite.edu`, 
          'student123'
        );
        
        const studentUser: User = {
          id: studentCredential.user.uid,
          email: `${student.rollNumber}@student.ignite.edu`,
          rollNumber: student.rollNumber,
          name: student.name,
          role: 'STUDENT',
          brigadeId: student.brigade,
          brigadeName: brigades.find(b => b.id === student.brigade)?.name,
          createdAt: new Date(),
          isActive: true
        };
        
        batch.set(doc(db, 'users', studentCredential.user.uid), studentUser);
      } catch (error) {
        console.error(`Error creating student ${student.rollNumber}:`, error);
      }
    }

    await batch.commit();

    // Create sample event
    const eventData: Omit<Event, 'id'> = {
      name: 'Ignite 2024 - Fresher Orientation',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: adminCredential.user.uid,
      createdAt: new Date(),
      isActive: true
    };

    const eventRef = await addDoc(collection(db, 'events'), eventData);

    // Create sample event plans
    const eventPlans = [
      {
        title: 'Morning Assembly',
        description: 'Welcome session for all freshers with college introduction and brigade formation',
        date: new Date(),
        time: '09:00 AM',
        endTime: '10:00 AM',
        associatedEventId: eventRef.id,
        planType: 'withoutSubmission' as const,
        createdBy: adminCredential.user.uid,
        createdAt: new Date(),
        isActive: true
      },
      {
        title: 'Ice Breaker Activities',
        description: 'Fun activities to help students get to know each other within their brigades',
        date: new Date(),
        time: '10:30 AM',
        endTime: '12:00 PM',
        associatedEventId: eventRef.id,
        planType: 'withSubmission' as const,
        submissionType: 'file' as const,
        fileSizeLimit: 5,
        createdBy: adminCredential.user.uid,
        createdAt: new Date(),
        isActive: true
      },
      {
        title: 'Leadership Workshop',
        description: 'Interactive workshop on leadership skills and team building exercises',
        date: new Date(),
        time: '02:00 PM',
        endTime: '04:00 PM',
        associatedEventId: eventRef.id,
        planType: 'withSubmission' as const,
        submissionType: 'text' as const,
        createdBy: adminCredential.user.uid,
        createdAt: new Date(),
        isActive: true
      },
      {
        title: 'Cultural Performance',
        description: 'Showcase of talents and cultural performances by students',
        date: new Date(),
        time: '04:30 PM',
        endTime: '06:00 PM',
        associatedEventId: eventRef.id,
        planType: 'withoutSubmission' as const,
        createdBy: adminCredential.user.uid,
        createdAt: new Date(),
        isActive: true
      }
    ];

    for (const plan of eventPlans) {
      await addDoc(collection(db, 'eventPlans'), plan);
    }

    console.log('Database seeding completed successfully!');
    
    // Sign out after seeding
    await auth.signOut();
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};