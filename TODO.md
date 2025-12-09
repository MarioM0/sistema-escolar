# TODO: Fix Principal Teacher Association in MateriaMaestro Table

## Docker Compose Setup Resolution
- [x] Fixed Docker Compose postgres container 'ContainerConfig' KeyError by switching to postgres:13 and removing volume mount
- [x] Successfully started all containers: postgres, backend, and frontend
- [x] Backend server running on port 3000, frontend accessible via nginx

## Tasks
- [x] Modify backend/src/routes/materias.js POST route: Ensure maestro_id is included in maestros array before setMaestros + handle name-to-ID conversion
- [x] Modify backend/src/routes/materias.js PUT route: Ensure maestro_id is included in maestros array before setMaestros + handle name-to-ID conversion
- [x] Fix frontend/src/components/configure-courses.tsx handleSaveEdit: Reverted to original mapping (names instead of IDs as requested)
- [x] Reverted maestros input back to text inputs (as preferred by user) in both add and edit modes
- [x] Fix inconsistency in PUT response to return maestros as objects like POST
- [x] Fix usuarios.js routes to remove non-existent 'grupo' column references

## Followup Steps
- [x] Test adding a new subject with maestro_id to ensure it appears in CourseTeachersList
- [x] Test editing a subject

## New Task: Fix "Ver Alumnos" Button Functionality
- [x] Update backend endpoint to use teacherId instead of teacherMatricula for better reliability
- [x] Add teacherId to TeacherStudentsListProps interface
- [x] Update TeacherStudentsList component to accept and use teacherId
- [x] Update CourseTeachersList to pass teacherId to TeacherStudentsList
- [x] Update API call to use new endpoint format
- [x] Verify build passes without TypeScript errors

## Followup Steps for New Task
- [x] Test clicking "Ver Alumnos" button to ensure it shows all students of the teacher for that group in that subject
