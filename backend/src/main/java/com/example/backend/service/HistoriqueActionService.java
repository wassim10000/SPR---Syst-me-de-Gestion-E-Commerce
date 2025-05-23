package com.example.backend.service;

import com.example.backend.entity.HistoriqueAction;
import com.example.backend.repository.HistoriqueActionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class HistoriqueActionService {

    @Autowired
    private HistoriqueActionRepository historiqueActionRepository;

    public List<HistoriqueAction> findAll() {
        return historiqueActionRepository.findAll();
    }

    public HistoriqueAction findById(Long id) {
        return historiqueActionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historique d'action non trouvé"));
    }

    public List<HistoriqueAction> findByUtilisateurId(Long utilisateurId) {
        return historiqueActionRepository.findByUtilisateurId(utilisateurId);
    }

    public HistoriqueAction create(HistoriqueAction historiqueAction) {
        return historiqueActionRepository.save(historiqueAction);
    }

    public void delete(Long id) {
        historiqueActionRepository.deleteById(id);
    }
} 