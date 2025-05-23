// import { usersRepo, User, BulkUserInput, ValidatedBulkUser } from '../repo/users';
// import { mentorsRepo, MentorProfile } from '../repo/mentors';
// import { menteesRepo, MenteeProfile } from '../repo/mentees';
// import { orgMembershipRepo } from '../repo/orgMembership';
// import { db } from '../db';
import { db } from '@/server/db';
// import { userProfileImage } from '../db/schema';
import { eq } from 'drizzle-orm';
import { User, userRepo } from '../repo/user';

interface UserWithProfiles extends User {
    // mentorProfile: MentorProfile | null;
    // menteeProfile: MenteeProfile | null;
}

export const userService = {
    // Get user profile with role-specific information
    // async getUserProfile(userId: string): Promise<UserWithProfiles | null> {
    //     const user = await userRepo.getById(userId);
    //     if (!user) return null;
    //     const mentorProfile = await mentorsRepo.getByUserId(userId);
    //     const menteeProfile = await menteesRepo.getByUserId(userId);
    //     // Check if user is an org_admin via membership
    //     const orgMembership = await orgMembershipRepo.getByUserId(userId);
    //     const role =
    //         orgMembership?.role === 'org_admin' ? 'org_admin' : user.role;
    //     return {
    //         ...user,
    //         mentorProfile: mentorProfile || null,
    //         menteeProfile: menteeProfile || null,
    //         role,
    //     };
    // },
    // Check if user is a mentor
    // async isUserMentor(userId: string): Promise<boolean> {
    //     const mentorProfile = await mentorsRepo.getByUserId(userId);
    //     return Boolean(mentorProfile && mentorProfile.status === 'active');
    // },
    // Check if user is a mentee
    // async isUserMentee(userId: string): Promise<boolean> {
    //     const menteeProfile = await menteesRepo.getByUserId(userId);
    //     return Boolean(menteeProfile && menteeProfile.status === 'active');
    // },
    // Get display avatar for a user from the dedicated userProfileImage table
    // async getUserDisplayAvatar(userId: string): Promise<string | null> {
    //     const imageRecord = await db.query.userProfileImage.findFirst({
    //         where: eq(userProfileImage.userId, userId),
    //         orderBy: (fields, operators) => [operators.desc(fields.updatedAt)], // Get the latest if multiple (though userId is unique)
    //     });
    //     if (imageRecord?.imageData) {
    //         return imageRecord.imageData;
    //     }
    //     return null; // No avatar found
    // },
    // Update user profile
    // async updateUser(
    //     userId: string,
    //     data: {
    //         name?: string;
    //         image?: string | null;
    //         role?: string;
    //         timezone?: string;
    //     },
    // ) {
    //     return await usersRepo.update(userId, data);
    // },
    // Change user role
    // async changeUserRole(userId: string, role: string) {
    //     return await usersRepo.update(userId, { role });
    // },
    // Update user email verification status
    // async setEmailVerified(userId: string, verified: boolean = true) {
    //     return await usersRepo.update(userId, { emailVerified: verified });
    // },
    // Check if any users are registered on the platform
    // async areUsersRegistered(): Promise<boolean> {
    //     const count = await usersRepo.getCount();
    //     return count > 0;
    // },
    // Create an admin user during initial setup
    // async createAdminUser(data: {
    //     name: string;
    //     email: string;
    //     password: string;
    //     timezone?: string;
    // }): Promise<User> {
    //     // Check if user already exists
    //     const existingUser = await usersRepo.getByEmail(data.email);
    //     if (existingUser) {
    //         console.log('Admin user already exists');
    //         return existingUser;
    //     }
    //     // Delegate creation to the repository
    //     return await usersRepo.createAdminUser(data);
    // },
    // Validate bulk user uploads
    // async validateBulkUsers(
    //     users: BulkUserInput[],
    // ): Promise<ValidatedBulkUser[]> {
    //     if (users.length === 0) return [];
    //     // Get all emails for existence check
    //     const emails = users.map((u) => u.email);
    //     // Check existing users in bulk (single DB call)
    //     const existingUsersMap = await usersRepo.checkExistingUsers(emails);
    //     // Process each user
    //     const validatedUsers = await Promise.all(
    //         users.map(async (user) => {
    //             const validationErrors: Record<string, string> = {};
    //             let organizationId: string | undefined;
    //             let mentorGroupId: string | undefined;
    //             // Validate email format
    //             const emailRegex =
    //                 /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //             if (!emailRegex.test(user.email)) {
    //                 validationErrors.email = 'Invalid email format';
    //             }
    //             // Validate role
    //             if (
    //                 !['admin', 'mentee', 'mentor', 'moderator'].includes(
    //                     user.role,
    //                 )
    //             ) {
    //                 validationErrors.role =
    //                     'Invalid role. Must be admin, mentee, mentor, or moderator';
    //             }
    //             // Check role-entity constraints
    //             if (user.organizationSlug && user.role !== 'mentee') {
    //                 validationErrors.organization =
    //                     'Organization can only be set for mentees';
    //             }
    //             if (user.mentorGroupSlug && user.role !== 'mentor') {
    //                 validationErrors.mentorGroup =
    //                     'Mentor group can only be set for mentors';
    //             }
    //             // Resolve organization slug to ID if valid
    //             if (user.organizationSlug && user.role === 'mentee') {
    //                 try {
    //                     const org = await usersRepo.findOrganizationByName(
    //                         user.organizationSlug,
    //                     );
    //                     if (org) {
    //                         organizationId = org.id;
    //                     } else {
    //                         validationErrors.organization = `Organization "${user.organizationSlug}" not found`;
    //                     }
    //                 } catch (error) {
    //                     console.error('Error finding organization:', error);
    //                     validationErrors.organization =
    //                         'Error validating organization';
    //                 }
    //             }
    //             // Resolve mentor group slug to ID if valid
    //             if (user.mentorGroupSlug && user.role === 'mentor') {
    //                 try {
    //                     const group = await usersRepo.findMentorGroupByName(
    //                         user.mentorGroupSlug,
    //                     );
    //                     if (group) {
    //                         mentorGroupId = group.id;
    //                     } else {
    //                         validationErrors.mentorGroup = `Mentor group "${user.mentorGroupSlug}" not found`;
    //                     }
    //                 } catch (error) {
    //                     console.error('Error finding mentor group:', error);
    //                     validationErrors.mentorGroup =
    //                         'Error validating mentor group';
    //                 }
    //             }
    //             return {
    //                 ...user,
    //                 organizationId,
    //                 mentorGroupId,
    //                 isValid: Object.keys(validationErrors).length === 0,
    //                 userExists: existingUsersMap[user.email] || false,
    //                 validationErrors:
    //                     Object.keys(validationErrors).length > 0
    //                         ? validationErrors
    //                         : undefined,
    //             };
    //         }),
    //     );
    //     return validatedUsers;
    // },
};
