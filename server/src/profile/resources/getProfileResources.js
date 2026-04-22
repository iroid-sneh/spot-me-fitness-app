import { baseUrl } from "../../common/helper.js";
import getUserMediaResources from "../../media/resources/getUserMediaResources.js";

export default class getProfileResources {
    constructor(data) {
        return {
            id: data.profile?.id,
            userId: data.profile?.user_id,
            fullName: data.profile?.full_name,
            bio: data.profile?.bio,
            gender: data.profile?.gender,
            birthdate: data.profile?.birthdate,
            heightCm: data.profile?.height_cm,
            distancePrefKm: data.profile?.distance_pref_km,
            mainProfilePhotoId: data.profile?.main_profile_photo_id,
            profileStatus: data.profile?.profile_status,
            activatedAt: data.profile?.activated_at,
            fitness: data.fitness
                ? {
                      workoutTypes: data.fitness.workout_types || [],
                      workoutFrequency: data.fitness.workout_frequency,
                      fitnessGoals: data.fitness.fitness_goals || [],
                      trainingStyles: data.fitness.training_styles || [],
                      dietStyle: data.fitness.diet_style,
                      intent: data.fitness.intent,
                      stylePreference: data.fitness.style_preference,
                  }
                : null,
            lifestyle: data.lifestyle
                ? {
                      smoking: data.lifestyle.smoking,
                      drinking: data.lifestyle.drinking,
                      kids: data.lifestyle.kids,
                      language: data.lifestyle.language,
                      lookingFor: data.lifestyle.looking_for,
                  }
                : null,
            media: Array.isArray(data.media) ? data.media.map((m) => new getUserMediaResources(m)) : [],
            badge: data.badge
                ? {
                      status: data.badge.status,
                      lastActivityAt: data.badge.last_activity_at,
                      lastUpdated: data.badge.last_updated,
                  }
                : null,
            distanceKm: data.distanceKm ?? null,
        };
    }
}
