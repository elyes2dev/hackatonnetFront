export interface SponsorInfoDTO {
    id: number;
    name: string;
    lastname: string;
    companyName: string;
    companyLogo: string;
    websiteUrl: string;
    reputationPoints: number;
    badge: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    badgeIcon: string;
}
