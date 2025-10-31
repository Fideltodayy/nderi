import { useQuery, useMutation } from '@tanstack/react-query';
import { db, Student } from '@/lib/db';
import { queryClient } from '@/lib/queryClient';

export function useStudents() {
  return useQuery({
    queryKey: ['/students'],
    queryFn: async () => {
      return await db.students.toArray();
    }
  });
}

export function useAddStudent() {
  return useMutation({
    mutationFn: async (student: Omit<Student, 'id'>) => {
      return await db.students.add(student);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/students'] });
    }
  });
}

export function useUpdateStudent() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Student> }) => {
      return await db.students.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/students'] });
    }
  });
}

export function useDeleteStudent() {
  return useMutation({
    mutationFn: async (id: number) => {
      return await db.students.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/students'] });
    }
  });
}
