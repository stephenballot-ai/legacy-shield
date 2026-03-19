# Migration Plan: LegacyShield to bitatlas-group

**Status:** Draft / Pending Approval
**Owner:** Lobbi (AI Co-founder)
**Target Org:** [bitatlas-group](https://github.com/bitatlas-group)

## Phase 1: GitHub & Secrets
- [ ] **Transfer Repository**: Move `stephenballot-ai/legacy-shield` to `bitatlas-group`.
- [ ] **Organization Secrets**: Migrate the following from repo to organization secrets in `bitatlas-group`:
    - `SSH_HOST`
    - `SSH_USERNAME`
    - `SSH_KEY`
- [ ] **Local Remote**: Update local git remote:
    ```bash
    git remote set-url origin git@github.com:bitatlas-group/legacy-shield.git
    ```

## Phase 2: Production VPS (89.167.36.119)
- [ ] **Update Production Remote**: SSH into VPS and update the remote in `/opt/legacyshield/app`.
- [ ] **Deploy Keys**: Ensure the VPS deployment key is added to the new repo/org.

## Phase 3: Automation & Crons
- [ ] **Blog Engine**:
    - Update remote in `/Users/stephenballot/Documents/LegacyShield/`.
    - Verify cron ID `9f233ff7-a9b1-4897-aa44-76c07464ee1b` still functions correctly.
- [ ] **Daily Report**: Verify connection to production DB remains stable.

## Phase 4: Verification
- [ ] **Trigger CI/CD**: Run `Deploy LegacyShield` workflow manually.
- [ ] **Blog Dry-run**: Run the blog engine manually to confirm push access.
