import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@nestjs/passport';
import { RequestUserOwnershipGuard } from 'src/common';
import { StudentDashboardController } from './student-dashboard.controller';
import { StudentDashboardService } from './student-dashboard.service';

describe('StudentDashboardController', () => {
	let controller: StudentDashboardController;
	const mockDashboard = {
		user: { name: 'Ana Silva' },
	};

	const mockStudentDashboardService = {
		getDashboard: jest.fn().mockResolvedValue(mockDashboard),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [StudentDashboardController],
			providers: [
				{
					provide: StudentDashboardService,
					useValue: mockStudentDashboardService,
				},
			],
		})
			.overrideGuard(AuthGuard('firebase-auth'))
			.useValue({ canActivate: jest.fn(() => true) })
			.overrideGuard(RequestUserOwnershipGuard)
			.useValue({ canActivate: jest.fn(() => true) })
			.compile();

		controller = module.get<StudentDashboardController>(
			StudentDashboardController,
		);
		jest.clearAllMocks();
	});

	it('retorna dashboard do estudante autenticado', async () => {
		const req = { user: { uid: 'user-1' } };

		const result = await controller.getStudentDashboard(req, 'iara');

		expect(result).toEqual(mockDashboard);
		expect(mockStudentDashboardService.getDashboard).toHaveBeenCalledWith(
			'user-1',
			'iara',
		);
	});
});
